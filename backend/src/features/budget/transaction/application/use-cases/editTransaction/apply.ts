import { Prisma } from "@prisma/client";
import { Transaction } from "../../../../../../shared/types/db";
import { accountService } from "../../../../account/account.service";
import {
  getTransactionSnapshotWithPair,
  TransactionSnapshot,
} from "./getTransactionSnapshotWithPair";
import { Decimal } from "@prisma/client/runtime/library";
import { EditTransactionIntent } from "./intent";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";

/**
 * Applies an `EditTransactionIntent` to the database and returns an updated snapshot,
 * handling both regular edits and transfer lifecycle changes.
 *
 * The intent is expected to come from `buildEditIntent()` and contains:
 * - `updateData`: non-transfer field updates for the main transaction
 * - `transfer`: a resolved transfer intent describing how to treat paired transfer records
 *
 * Transfer behavior:
 * - `remove`: unlinks the main transaction from its transfer fields, best-effort deletes
 *   the paired transaction (if found), then applies any remaining non-transfer edits.
 * - `none`: applies `updateData` only and returns the snapshot (no transfer work).
 * - `create`: validates the target account, updates the main transaction to point to the
 *   target transfer account, creates a mirrored paired transaction in the target account,
 *   and links main -> paired via `transferTransactionId`.
 * - `change`: validates the new target account, deletes the previous paired transaction
 *   if present, updates the main transaction to the new target, creates a new mirrored
 *   paired transaction, and relinks main -> new paired.
 *
 * Notes:
 * - Uses the provided Prisma transaction client for all reads/writes.
 * - Returns a fresh snapshot via `getTransactionSnapshotWithPair` after changes.
 * - Assumes helper functions/services enforce authorization/ownership (e.g. account access).
 *
 * @param tx - Prisma transaction client used for all database operations
 * @param userId - ID of the user performing the edit (used for authorization/snapshot fetch)
 * @param before - Snapshot of the transaction (and optional paired transfer) before applying changes
 * @param intent - The edit intent to apply (update data + transfer intent)
 *
 * @returns The updated transaction snapshot (including paired transfer if applicable)
 */

export async function applyEditIntent(
  tx: Prisma.TransactionClient,
  userId: string,
  before: TransactionSnapshot,
  intent: EditTransactionIntent
): Promise<TransactionSnapshot> {
  const transfer = intent.transfer;

  // Changing a transfer to a normal transaction
  if (transfer.type === "remove") {
    const pairedId =
      before.pairedTx?.id ?? before.mainTx.transferTransactionId ?? null;

    // // 1) Unlink main
    await transactionRepository.updateTransaction(tx, before.mainTx.id, {
      transferAccountId: null,
      transferTransactionId: null,
    });

    // 2) Delete paired
    if (pairedId) {
      transactionRepository.deleteTransactions(tx, [pairedId], userId);
    }

    // 3) Apply other (non-transfer) edits
    if (intent.updateData && Object.keys(intent.updateData).length > 0) {
      await transactionRepository.updateTransaction(
        tx,
        before.mainTx.id,
        intent.updateData
      );
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
      const pairedUpdate: Prisma.TransactionUpdateInput = {};

      // mirror date/memo/cleared/payee
      if (intent.updateData.date !== undefined)
        pairedUpdate.date = intent.updateData.date;
      if (intent.updateData.memo !== undefined)
        pairedUpdate.memo = intent.updateData.memo;
      if (intent.updateData.cleared !== undefined)
        pairedUpdate.cleared = intent.updateData.cleared;
      if (intent.updateData.payee !== undefined) {
        pairedUpdate.payee = intent.updateData.payee;
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
      pairedUpdate.category = { disconnect: true };

      if (Object.keys(pairedUpdate).length > 0) {
        await transactionRepository.updateTransaction(
          tx,
          before.pairedTx.id,
          pairedUpdate
        );
      }
    }

    return await getTransactionSnapshotWithPair(tx, userId, mainTx.id);
  }

  // Changing a normal tx to a transfer tx
  if (transfer.type === "create") {
    // Set main.transferAccountId (and clear transferTransactionId for now)
    await accountService.getAccount(tx, transfer.targetAccountId, userId);
    mainTx = await transactionRepository.updateTransaction(tx, mainTx.id, {
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
    await transactionRepository.updateTransaction(tx, mainTx.id, {
      transferTransactionId: paired.id,
    });

    return await getTransactionSnapshotWithPair(tx, userId, mainTx.id);
  }

  // Moving a transfer tx to a new account
  if (transfer.type === "change") {
    await accountService.getAccount(tx, transfer.targetAccountId, userId);

    // Update main to new target + clear link temporarily
    mainTx = await transactionRepository.updateTransaction(tx, mainTx.id, {
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
    await transactionRepository.updateTransaction(tx, mainTx.id, {
      transferTransactionId: newPaired.id,
    });

    return await getTransactionSnapshotWithPair(tx, userId, mainTx.id);
  }

  // Exhaustive guard
  return await getTransactionSnapshotWithPair(tx, userId, mainTx.id);
}

function mirrorAmounts(main: Transaction) {
  // Paired inflow = main outflow ; paired outflow = main inflow
  return {
    inflow: main.outflow?.abs?.() ?? new Decimal(main.outflow),
    outflow: main.inflow?.abs?.() ?? new Decimal(main.inflow),
  };
}
