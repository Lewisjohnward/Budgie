import { Prisma } from "@prisma/client";
import { accountService } from "../../../../account/account.service";
import { getTransactionSnapshotWithPair } from "./getTransactionSnapshotWithPair";
import { Decimal } from "@prisma/client/runtime/library";
import { type EditTransactionIntent } from "./intent";
import { transactionRepository } from "../../../../../../../shared/repository/transactionRepositoryImpl";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import {
  type DomainTransferTransaction,
  type db,
} from "../../../transaction.types";
import { type UserId } from "../../../../../../user/auth/auth.types";
import { type TransactionSnapshot } from "./types";
import { transactionMapper } from "../../../transaction.mapper";

/**
 * Result returned after applying an edit transaction intent.
 *
 * Contains the updated transaction snapshot and any transfer counterpart
 * transactions created or deleted as a result of the edit.
 *
 * @property snapshot - The updated transaction snapshot, including the
 * main transaction and its paired transaction if applicable.
 * @property createdTransaction - The newly created transfer counterpart,
 * if the edit created or replaced an existing transfer counterpart.
 * @property deletedTransaction - The deleted transfer counterpart, if the
 * edit removed or replaced an existing transfer counterpart.
 */
export type ApplyEditIntentResult = {
  snapshot: TransactionSnapshot;
  createdTransaction?: DomainTransferTransaction;
  deletedTransaction?: DomainTransferTransaction;
};

/**
 * Applies an `EditTransactionIntent` to a transaction, handling regular edits
 * and transfer lifecycle operations, and returns the resulting transaction
 * snapshot along with any created or deleted transfer counterparts.
 *
 * This function ensures domain invariants are maintained for both normal and
 * transfer transactions.
 *
 * Behavior by transfer type:
 *
 * - **remove**: Converts a transfer into a normal transaction.
 *   - Unlinks `transferAccountId` and `transferTransactionId` from the main transaction.
 *   - Deletes the paired transfer transaction, if it exists.
 *   - Applies any remaining non-transfer updates.
 *   - Returns the deleted counterpart, if applicable.
 *
 * - **none**: Updates existing transaction fields without changing its transfer state.
 *   - Mirrors applicable changes to the paired transaction if the main transaction
 *     is a transfer.
 *   - Swaps `inflow` and `outflow` on the paired transaction when amounts change.
 *
 * - **create**: Converts a normal transaction into a transfer.
 *   - Validates the target account.
 *   - Updates the main transaction to reference the target account.
 *   - Creates a paired transaction in the target account.
 *   - Links the main transaction to the paired transaction via `transferTransactionId`.
 *   - Returns the newly created counterpart.
 *
 * - **change**: Moves an existing transfer to a different target account.
 *   - Validates the new target account.
 *   - Updates the main transaction to reference the new target account.
 *   - Deletes the previous paired transaction, if it exists.
 *   - Creates a new mirrored paired transaction in the new target account.
 *   - Relinks the main transaction to the new paired transaction.
 *   - Returns both the newly created and deleted counterparts.
 *
 * Notes:
 * - All database operations are performed inside the provided Prisma transaction
 *   client (`tx`) to guarantee atomicity.
 * - Returns a fresh `TransactionSnapshot` via `getTransactionSnapshotWithPair`
 *   after applying the changes.
 * - Created and deleted counterpart transactions are returned as domain
 *   transactions so the caller can synchronise the client's local state.
 * - The caller is responsible for handling related side effects, such as
 *   account balance updates and budget month recalculations.
 * - Ownership and authorization checks for referenced transactions and accounts
 *   are enforced through the underlying services and repositories.
 *
 * @param tx - Prisma transaction client used for atomic database operations.
 * @param userId - ID of the user performing the edit, used for ownership enforcement.
 * @param before - Snapshot of the transaction and its optional paired transfer
 *   before the edit.
 * @param intent - Resolved edit intent containing:
 *   - `updateData`: Prisma-compatible updates for the main transaction.
 *   - `transfer`: Instructions describing the transfer lifecycle operation
 *     (`remove`, `none`, `create`, or `change`).
 *
 * @returns A promise resolving to an `ApplyEditIntentResult` containing:
 *   - `snapshot`: The updated transaction snapshot.
 *   - `createdTransaction`: The newly created transfer counterpart, if applicable.
 *   - `deletedTransaction`: The deleted transfer counterpart, if applicable.
 *
 * @throws If ownership or authorization rules are violated.
 * @throws If transfer invariants are broken, such as an invalid target account
 *   or a missing transfer counterpart.
 */
export async function applyEditIntent(
  tx: Prisma.TransactionClient,
  userId: UserId,
  before: TransactionSnapshot,
  intent: EditTransactionIntent
): Promise<ApplyEditIntentResult> {
  const transfer = intent.transfer;
  const mainId = before.mainTx.id;
  // Changing a transfer to a normal transaction
  if (transfer.type === "remove") {
    const paired = before.pairedTx;

    const categoryId =
      intent.updateData?.categoryId ??
      (await categoryRepository.getUncategorisedCategoryId(tx, userId));

    // Unlink main
    await transactionRepository.updateTransaction(tx, mainId, {
      transferAccountId: null,
      transferTransactionId: null,
      categoryId,
    });

    // Delete paired
    if (paired) {
      await transactionRepository.deleteTransactions(tx, [paired.id], userId);
    }

    // Apply remaining edits
    const { categoryId: _categoryId, ...rest } = intent.updateData ?? {};

    if (Object.keys(rest).length > 0) {
      await transactionRepository.updateTransaction(tx, mainId, rest);
    }

    return {
      snapshot: await getTransactionSnapshotWithPair(tx, userId, mainId),
      deletedTransaction: paired ? paired : undefined,
    };
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

    return {
      snapshot: await getTransactionSnapshotWithPair(tx, userId, mainId),
    };
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

    return {
      snapshot: await getTransactionSnapshotWithPair(tx, userId, mainId),
      createdTransaction: transactionMapper.toDomainTransferTransaction(paired),
    };
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

    return {
      snapshot: await getTransactionSnapshotWithPair(tx, userId, mainId),
      createdTransaction:
        transactionMapper.toDomainTransferTransaction(newPaired),
      deletedTransaction: before.pairedTx ? before.pairedTx : undefined,
    };
  }

  // Exhaustive guard
  return {
    snapshot: await getTransactionSnapshotWithPair(tx, userId, mainId),
  };
}

function mirrorAmounts(main: db.Transaction) {
  // Paired inflow = main outflow ; paired outflow = main inflow
  return {
    inflow: main.outflow?.abs?.() ?? new Decimal(main.outflow),
    outflow: main.inflow?.abs?.() ?? new Decimal(main.inflow),
  };
}
