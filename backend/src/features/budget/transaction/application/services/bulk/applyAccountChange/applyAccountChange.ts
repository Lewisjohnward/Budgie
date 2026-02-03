import { Prisma } from "@prisma/client";
import {
  type TransactionId,
  type DomainTransferTransaction,
  type DomainNormalTransaction,
} from "../../../../transaction.types";
import { accountService } from "../../../../../account/account.service";
import { OperationMode } from "../../../../../../../shared/enums/operation-mode";
import { transactionService } from "../../../../transaction.service";
import { transactionRepository } from "../../../../../../../shared/repository/transactionRepositoryImpl";
import { filterInvalidBulkEditTransfers } from "./filterInvalidBulkEditTransfers";
import { UpdatedTransferTransactionsMismatchError } from "../../../../transaction.errors";
import { type AccountId } from "../../../../../account/account.types";
import { UserId } from "../../../../../../user/auth/auth.types";

/**
 * Applies a bulk account change to a set of transactions while maintaining
 * transfer consistency and updating account balances.
 *
 * This function performs the following steps atomically within the provided
 * Prisma transaction client (`tx`):
 *
 * 1. Filters invalid transfer transactions using `filterInvalidBulkEditTransfers`:
 *    - Excludes transfer transactions where both sides are selected.
 *    - Excludes transfers whose target account would conflict with the new account.
 *
 * 2. Updates the `accountId` of the remaining selected transactions.
 *
 * 3. For any updated transfer transactions, updates the `transferAccountId`
 *    of their counterpart transactions so the transfer relationship remains valid.
 *
 * 4. Fetches the updated transactions (normal and transfers) including paired
 *    transactions to ensure correctness.
 *
 * 5. Validates that all selected transfer transactions were updated and no
 *    transfer invariants were violated.
 *
 * 6. Recalculates account balances:
 *    - Removes the effect of the pre-update transactions.
 *    - Applies the effect of the post-update transactions.
 *
 * Bulk edit invariants:
 * - Selected transfers must not include both sides in the same update.
 * - Selected transfers must not move onto their counterpart account.
 *
 * Notes:
 * - All reads/writes are performed within the provided transaction (`tx`)
 *   and should be executed atomically by the caller.
 * - If no valid transactions remain after filtering, the function returns early.
 *
 * @param tx - Prisma transaction client used for all operations.
 * @param userId - The owner of the transactions being modified.
 * @param accountId - The target account ID to apply to the selected transactions.
 * @param transactionIds - IDs of the transactions selected for the account change.
 * @param normalTransactions - Pre-update normal transactions, used to calculate balance adjustments.
 * @param allTransferTransactions - Pre-update transfer transactions, used to locate selected transfers and their counterparts.
 *
 * @throws {UpdatedTransferTransactionsMismatchError}
 * Thrown if the set of transfer transactions expected to be updated does not
 * match the set returned after the update, indicating a violation of transfer invariants.
 */

export const applyAccountChange = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  accountId: AccountId,
  transactionIds: TransactionId[],
  normalTransactions: DomainNormalTransaction[],
  allTransferTransactions: DomainTransferTransaction[]
): Promise<void> => {
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
  const preUpdateTransfers = allTransferTransactions.filter((t) =>
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
