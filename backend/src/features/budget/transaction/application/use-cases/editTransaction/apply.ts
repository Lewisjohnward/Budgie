import { Prisma } from "@prisma/client";
import { accountService } from "../../../../account/account.service";
import {
  getTransactionSnapshotWithPair,
  type TransactionSnapshot,
} from "./getTransactionSnapshotWithPair";
import { Decimal } from "@prisma/client/runtime/library";
import { type EditTransactionIntent } from "./intent";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { type db } from "../../../transaction.types";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Applies an `EditTransactionIntent` to a transaction, handling both regular edits
 * and transfer lifecycle operations, and returns an updated snapshot of the transaction.
 *
 * This function ensures domain invariants are maintained for both normal and transfer transactions.
 *
 * Behavior by transfer type:
 * - **remove**: Converts a transfer to a normal transaction.
 *   - Unlinks `transferAccountId` and `transferTransactionId` from the main transaction.
 *   - Deletes the paired transfer transaction (if it exists).
 *   - Applies any remaining non-transfer updates.
 * - **none**: Updates non-transfer fields only.
 *   - Mirrors changes to the paired transaction if the main transaction is a transfer.
 *   - Swaps `inflow`/`outflow` on paired transactions when amounts change.
 * - **create**: Converts a normal transaction into a transfer.
 *   - Validates the target account.
 *   - Updates the main transaction to point to the target account.
 *   - Creates a paired transaction in the target account.
 *   - Links the main transaction to the paired transaction via `transferTransactionId`.
 * - **change**: Moves a transfer to a new target account.
 *   - Deletes the previous paired transaction if present.
 *   - Creates a new mirrored paired transaction in the new target account.
 *   - Relinks the main transaction to the new paired transaction.
 *
 * Notes:
 * - All operations are performed inside the provided Prisma transaction client (`tx`) for atomicity.
 * - Returns a fresh `TransactionSnapshot` via `getTransactionSnapshotWithPair` after updates.
 * - Caller must ensure authorization and ownership of transactions/accounts.
 *
 * @param tx - Prisma transaction client used for atomic database operations.
 * @param userId - ID of the user performing the edit, used for ownership enforcement.
 * @param before - Snapshot of the transaction (and optional paired transfer) before edits.
 * @param intent - The edit intent, containing:
 *   - `updateData`: Non-transfer fields to update.
 *   - `transfer`: Instructions for handling transfer behavior (`remove`, `none`, `create`, `change`).
 *
 * @returns The updated `TransactionSnapshot`, including paired transfer if applicable.
 *
 * @throws Will throw if:
 * - Ownership or authorization rules are violated.
 * - Transfer invariants are broken (e.g., paired transaction missing, same-account transfer).
 */
export async function applyEditIntent(
  tx: Prisma.TransactionClient,
  userId: UserId,
  before: TransactionSnapshot,
  intent: EditTransactionIntent
): Promise<TransactionSnapshot> {
  const transfer = intent.transfer;
  const mainId = before.mainTx.id;
  // Changing a transfer to a normal transaction
  if (transfer.type === "remove") {
    const pairedId = before.isTransfer
      ? (before.pairedTx?.id ?? before.mainTx.transferTransactionId ?? null)
      : null;

    // pick category: payload wins, else default to Unassigned
    const categoryId =
      intent.updateData?.categoryId ??
      (await categoryRepository.getUncategorisedCategoryId(tx, userId));

    // // 1) Unlink main
    await transactionRepository.updateTransaction(tx, before.mainTx.id, {
      transferAccountId: null,
      transferTransactionId: null,
      categoryId,
    });

    // 2) Delete paired
    if (pairedId) {
      await transactionRepository.deleteTransactions(tx, [pairedId], userId);
    }

    // 3) Apply other (non-transfer) edits
    const { categoryId: _categoryId, ...rest } = intent.updateData ?? {};

    if (Object.keys(rest).length > 0) {
      await transactionRepository.updateTransaction(tx, mainId, rest);
    }

    return await getTransactionSnapshotWithPair(tx, userId, before.mainTx.id);
  }

  // Apply main updates (non-transfer fields)
  let mainTx = await transactionRepository.updateTransaction(
    tx,
    before.mainTx.id,
    intent.updateData
  );

  // Editing a transfer transaction - mirror on pairedTx
  if (transfer.type === "none") {
    if (before.isTransfer && before.pairedTx) {
      const pairedUpdate: Prisma.TransactionUncheckedUpdateInput = {};

      // mirror date/memo/cleared/payee
      if (intent.updateData.date !== undefined)
        pairedUpdate.date = intent.updateData.date;
      if (intent.updateData.memo !== undefined)
        pairedUpdate.memo = intent.updateData.memo;
      if (intent.updateData.cleared !== undefined)
        pairedUpdate.cleared = intent.updateData.cleared;
      if (intent.updateData.payeeId !== undefined) {
        pairedUpdate.payeeId = intent.updateData.payeeId;
      } // mirror amounts (swap)
      const inflowChanged = intent.updateData.inflow !== undefined;
      const outflowChanged = intent.updateData.outflow !== undefined;

      if (inflowChanged || outflowChanged) {
        // reload latest main amounts (we already have `main` after update)
        const mirrored = mirrorAmounts(mainTx);
        pairedUpdate.inflow = mirrored.inflow;
        pairedUpdate.outflow = mirrored.outflow;
      }

      // IMPORTANT: keep transfer invariants
      pairedUpdate.categoryId = null;

      if (Object.keys(pairedUpdate).length > 0) {
        await transactionRepository.updateTransaction(
          tx,
          before.pairedTx.id,
          pairedUpdate
        );
      }
    }

    return await getTransactionSnapshotWithPair(tx, userId, mainId);
  }

  // Changing a normal tx to a transfer tx
  if (transfer.type === "create") {
    // Set main.transferAccountId (and clear transferTransactionId for now)
    await accountService.getAccount(tx, transfer.targetAccountId, userId);
    mainTx = await transactionRepository.updateTransaction(tx, mainId, {
      transferAccountId: transfer.targetAccountId,
      transferTransactionId: null,
    });

    // Create paired transaction in target account
    const mirrored = mirrorAmounts(mainTx);

    const paired = await transactionRepository.createTransaction(tx, {
      accountId: transfer.targetAccountId,
      date: mainTx.date,
      memo: mainTx.memo,
      cleared: mainTx.cleared,

      // transfers excluded from months/categories
      categoryId: null,
      payeeId: null,

      inflow: mirrored.inflow,
      outflow: mirrored.outflow,

      transferAccountId: mainTx.accountId,
      transferTransactionId: mainTx.id,
    });

    // Link main -> paired
    await transactionRepository.updateTransaction(tx, mainId, {
      transferTransactionId: paired.id,
    });

    return await getTransactionSnapshotWithPair(tx, userId, mainId);
  }

  // Moving a transfer tx to a new account
  if (transfer.type === "change") {
    await accountService.getAccount(tx, transfer.targetAccountId, userId);

    // Update main to new target + clear link temporarily
    mainTx = await transactionRepository.updateTransaction(tx, mainId, {
      transferAccountId: transfer.targetAccountId,
      transferTransactionId: null,
    });

    // Delete old paired (transfer A -> transfer B)
    if (before.pairedTx) {
      await transactionRepository.deleteTransactions(
        tx,
        [before.pairedTx.id],
        userId
      );
    }

    // Create new paired in new target account
    const mirrored = mirrorAmounts(mainTx);

    const newPaired = await transactionRepository.createTransaction(tx, {
      accountId: transfer.targetAccountId,
      date: mainTx.date,
      memo: mainTx.memo,
      cleared: mainTx.cleared,

      // transfers excluded from months/categories
      categoryId: null,
      payeeId: null,

      inflow: mirrored.inflow,
      outflow: mirrored.outflow,

      transferAccountId: mainTx.accountId,
      transferTransactionId: mainTx.id,
    });

    // Relink main -> new paired
    await transactionRepository.updateTransaction(tx, mainId, {
      transferTransactionId: newPaired.id,
    });

    return await getTransactionSnapshotWithPair(tx, userId, mainId);
  }

  // Exhaustive guard
  return await getTransactionSnapshotWithPair(tx, userId, mainId);
}

function mirrorAmounts(main: db.Transaction) {
  // Paired inflow = main outflow ; paired outflow = main inflow
  return {
    inflow: main.outflow?.abs?.() ?? new Decimal(main.outflow),
    outflow: main.inflow?.abs?.() ?? new Decimal(main.inflow),
  };
}
