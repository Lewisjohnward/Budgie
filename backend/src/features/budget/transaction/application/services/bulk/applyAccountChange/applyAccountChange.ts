import { Prisma } from "@prisma/client";
import {
  NormalTransactionEntity,
  TransferTransactionEntity,
} from "../../../../transaction.types";
import { accountService } from "../../../../../account/account.service";
import { OperationMode } from "../../../../../../../shared/enums/operation-mode";
import { transactionService } from "../../../../transaction.service";
import { transactionRepository } from "../../../../../../../shared/repository/transactionRepositoryImpl";
import { filterInvalidBulkEditTransfers } from "./filterInvalidBulkEditTransfers";
import { UpdatedTransferTransactionsMismatchError } from "../../../../transaction.errors";

/**
 * Bulk-updates the account for a set of transactions and keeps transfer pairing
 * and account balances consistent.
 *
 * What this does:
 * - Updates `accountId` for the selected transactions.
 * - For any updated transfer transaction, updates the paired transaction's
 *   `transferAccountId` so the transfer relationship remains valid.
 * - Recomputes balances by removing the pre-update effects of the affected
 *   transactions and then applying the post-update effects.
 *
 * Bulk-edit transfer constraints:
 * - Transaction ids are pre-filtered via `filterInvalidBulkEditTransfers(...)`
 *   to exclude transfers that would create invalid or ambiguous states in the
 *   context of a bulk edit (e.g. both sides selected or moving onto the
 *   counterpart account).
 *
 * Notes:
 * - All reads/writes occur within the provided Prisma transaction client (`tx`)
 *   and must be executed atomically by the caller.
 * - If no transactions remain after filtering, the function returns early.
 *
 * @param tx Prisma transaction client used to execute all operations atomically.
 * @param userId Owner of the transactions being modified.
 * @param accountId Destination account id to apply to the selected transactions.
 * @param transactionIds Transaction ids selected for the bulk account change.
 * @param normalTransactions Pre-update normal transactions (may include more than selected).
 * @param allTransferTransactions Pre-update transfer transactions (may include more than selected), used to locate selected transfers and their pairs.
 *
 * @throws {UpdatedTransferTransactionsMismatchError}
 * Thrown if the set of transfer transactions expected to be updated does not
 * match the set returned after the update (indicating an invariant violation).
 */

export const applyAccountChange = async (
  tx: Prisma.TransactionClient,
  userId: string,
  accountId: string,
  transactionIds: string[],
  normalTransactions: NormalTransactionEntity[],
  allTransferTransactions: TransferTransactionEntity[]
) => {
  // transactions the user explicitly selected
  const selectedIds = new Set(transactionIds);

  // transactions provided by user that are transfers
  const selectedTransferTransactions = allTransferTransactions.filter((t) =>
    selectedIds.has(t.id)
  );

  const account = await accountService.getAccount(tx, accountId, userId);
  const targetAccountId = account.id;

  // filter out transfer transactions if both sides are selected
  // filter out transfer transactions if the target account is the
  // transfers counterpart
  const transactionIdsToUpdate = filterInvalidBulkEditTransfers(
    transactionIds,
    selectedTransferTransactions,
    targetAccountId
  );

  if (transactionIdsToUpdate.length === 0) return;

  /// update accountId
  await transactionRepository.bulkUpdateAccountId(
    tx,
    transactionIdsToUpdate,
    targetAccountId
  );

  // Update counterpart transferAccountId ONLY for transfers we actually updated
  const idsToUpdateSet = new Set(transactionIdsToUpdate);

  // Normal transactions before update
  const preUpdateNormals = normalTransactions.filter((t) =>
    idsToUpdateSet.has(t.id)
  );

  // Transfer transactions before update
  const preUpdateTransfers = selectedTransferTransactions.filter((t) =>
    idsToUpdateSet.has(t.id)
  );

  // set the pair of the transfer transaction to the updated accountId
  if (preUpdateTransfers.length > 0) {
    const otherSideIds = [
      ...new Set(preUpdateTransfers.map((t) => t.transferTransactionId)),
    ];

    await transactionRepository.bulkUpdateTransferAccountId(
      tx,
      otherSideIds,
      targetAccountId
    );
  }

  // fetch the updated transactions
  const {
    normalTransactions: updatedTransactions,
    allTransferTransactions: updatedAllTransferTransactions,
  } = await transactionService.getTransactionsWithPairs(
    tx,
    userId,
    transactionIdsToUpdate
  );

  // updated transfer txs for the originally selected ids (not "all pairs")
  const updatedSelectedTransfers = updatedAllTransferTransactions.filter((t) =>
    idsToUpdateSet.has(t.id)
  );

  // Assert transfer counts and ids line up
  const beforeTransferIdSet = new Set(preUpdateTransfers.map((t) => t.id));
  const afterTransferIdSet = new Set(updatedSelectedTransfers.map((t) => t.id));

  if (
    beforeTransferIdSet.size !== afterTransferIdSet.size ||
    [...beforeTransferIdSet].some((id) => !afterTransferIdSet.has(id))
  ) {
    throw new UpdatedTransferTransactionsMismatchError({
      beforeTransferIds: [...beforeTransferIdSet],
      afterTransferIds: [...afterTransferIdSet],
    });
  }

  await accountService.updateAccountBalances(
    tx,
    [...preUpdateNormals, ...preUpdateTransfers],
    OperationMode.Delete
  );

  await accountService.updateAccountBalances(
    tx,
    [...updatedTransactions, ...updatedSelectedTransfers],
    OperationMode.Add
  );
};
