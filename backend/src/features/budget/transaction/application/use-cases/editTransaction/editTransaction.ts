import { prisma } from "../../../../../../shared/prisma/client";
import { EditSingleTransactionPayload } from "../../../transaction.schema";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { accountService } from "../../../../account/account.service";
import { categoryService } from "../../../../category/category.service";
import { getTransactionSnapshotWithPair } from ".././editTransaction/getTransactionSnapshotWithPair";
import { buildEditIntent } from ".././editTransaction/intent";
import { applyEditIntent } from ".././editTransaction/apply";
import { recalcMonthsFor } from ".././editTransaction/reclaculateMonthsFor";
import { memoService } from "../../../../memo/memo.service";
import { assertTransactionDateWithinLast12Months } from "../../../utils/assertTransactionDateWithinLast12Months";

// TODO:(lewis 2026-02-01 09:52) needs rewriting
/**
 * Edits a single transaction and applies all related side effects atomically.
 *
 * This is the top-level orchestration function for transaction edits. It executes
 * the entire edit workflow inside a single database transaction to ensure
 * consistency across:
 *
 * - the transaction record itself
 * - any paired transfer transaction
 * - affected account balances
 * - affected category month aggregates
 *
 * The edit process follows these phases:
 *
 * 1. **Snapshot**
 *    Fetches an immutable snapshot of the transaction (and paired transfer, if any)
 *    to establish a stable “before” state.
 *
 * 2. **Intent building**
 *    Resolves a fully-specified edit intent from the snapshot and payload,
 *    including field updates and any transfer lifecycle changes.
 *
 * 3. **Apply intent**
 *    Persists the edit intent, creating, updating, or removing paired transfer
 *    transactions as required, and returns an “after” snapshot.
 *
 * 4. **Side effects**
 *    - Reverts account balance effects from the “before” snapshot
 *    - Applies account balance effects from the “after” snapshot
 *    - Ensures required category month rows exist
 *    - Recalculates category month activity for normal (non-transfer) transactions
 *
 * Transfer transactions are explicitly excluded from category month recalculation.
 *
 * All operations are executed within a single Prisma transaction; if any step
 * fails, the entire edit is rolled back.
 *
 * @param userId - ID of the user performing the edit (used for ownership checks)
 * @param transactionId - ID of the transaction to edit
 * @param payload - Partial edit payload describing the requested changes
 *
 * @throws {NoTransactionsFoundError}
 * Thrown if the transaction does not exist or is not owned by the user.
 *
 * @throws {TransferPairMissingError}
 * Thrown if the transaction is marked as a transfer but its paired transaction
 * is missing (indicates data corruption).
 *
 * @throws Errors propagated from underlying services when referenced entities
 * (accounts, categories, payees) do not exist or are not owned by the user.
 */

export const editTransaction = async (
  userId: string,
  transactionId: string,
  payload: EditSingleTransactionPayload
) => {
  await prisma.$transaction(async (tx) => {
    if (payload.date !== undefined) {
      assertTransactionDateWithinLast12Months(payload.date);
    }

    const beforeTxSnapshot = await getTransactionSnapshotWithPair(
      tx,
      userId,
      transactionId
    );

    const intent = await buildEditIntent(tx, userId, beforeTxSnapshot, payload);

    const afterTxSnapshot = await applyEditIntent(
      tx,
      userId,
      beforeTxSnapshot,
      intent
    );

    await accountService.updateAccountBalances(
      tx,
      beforeTxSnapshot.pairedTx
        ? [beforeTxSnapshot.mainTx, beforeTxSnapshot.pairedTx]
        : [beforeTxSnapshot.mainTx],
      OperationMode.Delete
    );

    await accountService.updateAccountBalances(
      tx,
      afterTxSnapshot.pairedTx
        ? [afterTxSnapshot.mainTx, afterTxSnapshot.pairedTx]
        : [afterTxSnapshot.mainTx],
      OperationMode.Add
    );

    await categoryService.months.insertMissingMonths(
      tx,
      userId,
      afterTxSnapshot.mainTx.date
    );

    // insert the missing memos
    await memoService.insertMissingMemos(
      tx,
      userId,
      afterTxSnapshot.mainTx.date
    );

    if (!beforeTxSnapshot.isTransfer) {
      await recalcMonthsFor(
        tx,
        userId,
        [beforeTxSnapshot.mainTx],
        OperationMode.Delete
      );
    }
    if (!afterTxSnapshot.isTransfer) {
      await recalcMonthsFor(
        tx,
        userId,
        [afterTxSnapshot.mainTx],
        OperationMode.Add
      );
    }
  });
};
