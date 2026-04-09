import { prisma } from "../../../../../../shared/prisma/client";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { accountService } from "../../../../account/account.service";
import { categoryService } from "../../../../category/core/category.service";
import { getTransactionSnapshotWithPair } from ".././editTransaction/getTransactionSnapshotWithPair";
import { buildEditIntent } from ".././editTransaction/intent";
import { applyEditIntent } from ".././editTransaction/apply";
import { recalcMonthsFor } from ".././editTransaction/reclaculateMonthsFor";
import { memoService } from "../../../../memo/memo.service";
import { assertTransactionDateWithinLast12Months } from "../../../utils/assertTransactionDateWithinLast12Months";
import { type EditSingleTransactionPayload } from "../../../transaction.schema";
import {
  asCategoryId,
  type CategoryId,
} from "../../../../category/core/category.types";
import { type AccountId, asAccountId } from "../../../../account/account.types";
import { asTransactionId } from "../../../transaction.types";
import { asPayeeId, type PayeeId } from "../../../../payee/payee.types";
import { asUserId } from "../../../../../user/auth/auth.types";

/**
 * Represents a fully-branded edit command for a single transaction.
 *
 * Extends `EditSingleTransactionPayload` by:
 * - Omitting the raw `categoryId`, `accountId`, `transferAccountId`, `payeeId` fields.
 * - Replacing them with branded types (`CategoryId` / `AccountId` / `PayeeId`) or `null` if explicitly unset.
 *
 * This type is used internally to ensure type safety and domain correctness
 * when editing transactions.
 */
export type EditTransactionCommand = Omit<
  EditSingleTransactionPayload,
  "categoryId" | "accountId" | "transferAccountId" | "payeeId"
> & {
  /** Updated category ID for the transaction, or null to clear it */
  categoryId?: CategoryId | null;

  /** Updated account ID for the transaction */
  accountId?: AccountId;

  /** Updated transfer account ID for transfer transactions, or null to clear it */
  transferAccountId?: AccountId | null;

  /** Updated payee ID for transfer transactions, or null to clear it */
  payeeId?: PayeeId | null;
};

/**
 * Converts a raw `EditSingleTransactionPayload` from the API into a typed
 * `EditTransactionCommand` with branded IDs.
 *
 * - Ensures `categoryId` is either a branded `CategoryId`, `null`, or `undefined`.
 * - Ensures `accountId` is a branded `AccountId` or `undefined`.
 * - Ensures `transferAccountId` is either a branded `AccountId`, `null`, or `undefined`.
 * - Preserves all other fields from the original payload.
 *
 * @param payload - The raw edit transaction payload received from the caller or API
 * @returns A new object conforming to `EditTransactionCommand` with correctly branded IDs
 */
export const toEditTransactionCommand = (
  p: EditSingleTransactionPayload
): EditTransactionCommand => ({
  ...p,
  categoryId:
    p.categoryId === null
      ? null
      : p.categoryId
        ? asCategoryId(p.categoryId)
        : undefined,
  accountId: p.accountId ? asAccountId(p.accountId) : undefined,
  transferAccountId:
    p.transferAccountId === null
      ? null
      : p.transferAccountId
        ? asAccountId(p.transferAccountId)
        : undefined,
  payeeId:
    p.payeeId === null ? null : p.payeeId ? asPayeeId(p.payeeId) : undefined,
});

/**
 * Edits a single transaction and applies all related side effects atomically.
 *
 * This function orchestrates the full edit workflow for a transaction, including any paired transfer,
 * account balance updates, and category month recalculations. All operations are executed within a single
 * Prisma transaction to guarantee consistency; if any step fails, the entire edit is rolled back.
 *
 * Workflow:
 * 1. **Snapshot** – Fetches an immutable snapshot of the transaction and its paired transfer (if any)
 *    to establish a stable "before" state.
 * 2. **Intent building** – Generates a fully-specified edit intent based on the snapshot and provided payload.
 * 3. **Apply intent** – Persists the edit intent, creating/updating/removing paired transfers as needed,
 *    producing an "after" snapshot.
 * 4. **Side effects**:
 *    - Reverses account balance impact of the previous state
 *    - Applies account balance impact of the updated state
 *    - Ensures required category months and memos exist for the new date
 *    - Updates category month allocations for non-transfer transactions
 *      (remove old impact, apply new impact)
 *    - Refreshes deletable status for all affected accounts
 *
 * Notes:
 * - Transfer transactions are excluded from category month recalculation.
 * - Ownership and authorization checks are enforced implicitly via snapshot retrieval and services.
 *
 * @param userId - ID of the user performing the edit (used for ownership checks)
 * @param transactionId - ID of the transaction to edit
 * @param payload - Partial edit payload describing the requested changes, including optional:
 *   - `accountId` – Updated account for the transaction
 *   - `categoryId` – Updated category (can be branded or null)
 *   - `transferAccountId` – Updated transfer account for transfer transactions (can be branded or null)
 *   - `date`, `memo`, `inflow`, `outflow`, `payeeId`, etc.
 *
 * @returns A promise that resolves once the transaction and all side effects have been applied.
 *
 * @throws {NoTransactionsFoundError}
 * If the transaction does not exist or is not owned by the user.
 *
 * @throws {TransferPairMissingError}
 * If the transaction is a transfer but its paired transaction is missing (indicates data corruption).
 *
 * @throws Errors propagated from underlying services if referenced entities (accounts, categories, payees)
 * do not exist or are not owned by the user.
 */
export const editTransaction = async (
  userId: string,
  transactionId: string,
  payload: EditSingleTransactionPayload
): Promise<void> => {
  const uId = asUserId(userId);
  const brandedPayload = toEditTransactionCommand(payload);
  const id = asTransactionId(transactionId);

  await prisma.$transaction(async (tx) => {
    if (brandedPayload.date !== undefined) {
      assertTransactionDateWithinLast12Months(brandedPayload.date);
    }

    const beforeTxSnapshot = await getTransactionSnapshotWithPair(tx, uId, id);

    const intent = await buildEditIntent(
      tx,
      uId,
      beforeTxSnapshot,
      brandedPayload
    );

    const afterTxSnapshot = await applyEditIntent(
      tx,
      uId,
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
      uId,
      afterTxSnapshot.mainTx.date
    );

    // insert the missing memos
    await memoService.insertMissingMemos(tx, uId, afterTxSnapshot.mainTx.date);

    if (!beforeTxSnapshot.isTransfer) {
      await recalcMonthsFor(
        tx,
        uId,
        [beforeTxSnapshot.mainTx],
        OperationMode.Delete
      );
    }
    if (!afterTxSnapshot.isTransfer) {
      await recalcMonthsFor(
        tx,
        uId,
        [afterTxSnapshot.mainTx],
        OperationMode.Add
      );
    }

    await accountService.refreshDeletableStatus(tx, [
      ...new Set(
        [
          beforeTxSnapshot.mainTx.accountId,
          beforeTxSnapshot.pairedTx?.accountId,
          afterTxSnapshot.mainTx.accountId,
          afterTxSnapshot.pairedTx?.accountId,
        ].filter((id): id is AccountId => id != null)
      ),
    ]);
  });
};
