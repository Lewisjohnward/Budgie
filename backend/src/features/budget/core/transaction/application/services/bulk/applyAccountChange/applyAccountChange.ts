import { Prisma } from "@prisma/client";
import {
  type TransactionId,
  type DomainTransferTransaction,
  type DomainNormalTransaction,
  type DomainTransaction,
} from "../../../../transaction.types";
import { accountService } from "../../../../../account/account.service";
import { OperationMode } from "../../../../../../../../shared/enums/operation-mode";
import { transactionService } from "../../../../transaction.service";
import { transactionRepository } from "../../../../../../../../shared/repository/transactionRepositoryImpl";
import { filterInvalidBulkEditTransfers } from "./filterInvalidBulkEditTransfers";
import { UpdatedTransferTransactionsMismatchError } from "../../../../transaction.errors";
import {
  type DomainAccount,
  type AccountId,
} from "../../../../../account/account.types";
import { type UserId } from "../../../../../../../user/auth/auth.types";

type ApplyAccountChangeResult = {
  updatedAccounts: DomainAccount[];
  updatedTransactions: DomainTransaction[];
};

const noOpResult: ApplyAccountChangeResult = {
  updatedAccounts: [],
  updatedTransactions: [],
};

/**
 * Applies a bulk account change to a set of transactions while maintaining
 * transfer consistency and recalculating affected account balances.
 *
 * All operations are performed within the provided Prisma transaction client
 * (`tx`) and should be committed or rolled back atomically by the caller.
 *
 * The function performs the following steps:
 *
 * 1. Identifies the selected transfer transactions from the supplied
 *    pre-update transfer transactions.
 *
 * 2. Retrieves the target account belonging to the specified user.
 *
 * 3. Filters invalid transfer transactions using
 *    `filterInvalidBulkEditTransfers`:
 *    - Excludes transfers where both sides are selected.
 *    - Excludes transfers whose counterpart account matches the target account.
 *
 * 4. Returns an empty result if no valid transactions remain after filtering.
 *
 * 5. Updates the `accountId` of the remaining selected transactions.
 *
 * 6. Updates the `transferAccountId` of their counterpart transactions
 *    to maintain transfer consistency.
 *
 * 7. Retrieves the updated transactions, including their transfer counterparts.
 *
 * 8. Validates that all selected transfer transactions expected to be updated
 *    are present in the retrieved results.
 *
 * 9. Recalculates account balances:
 *    - Removes the balance impact of the pre-update transactions.
 *    - Applies the balance impact of the updated transactions and their
 *      corresponding transfer transactions.
 *
 * 10. Refreshes the deletable status of all affected accounts.
 *
 * 11. Retrieves the updated domain accounts for all affected account IDs.
 *
 * Bulk edit invariants:
 * - Both sides of a transfer cannot be selected in the same account change.
 * - A transfer cannot be moved to the account held by its counterpart.
 * - Every selected transfer that passes validation must be present in the
 *   updated transfer results.
 *
 * @param tx - Prisma transaction client used for all database operations.
 * @param userId - ID of the user who owns the transactions and accounts.
 * @param accountId - ID of the target account to assign to the selected transactions.
 * @param transactionIds - IDs of the transactions selected for the account change.
 * @param normalTransactions - Pre-update normal transactions used to identify
 *   affected transactions and calculate balance adjustments.
 * @param allTransferTransactions - Pre-update transfer transactions used to
 *   identify selected transfers and their counterparts.
 *
 * @throws {UpdatedTransferTransactionsMismatchError}
 * Thrown when the selected transfer transactions expected to be updated do
 * not match those retrieved after the update.
 *
 * @returns A promise resolving to the updated accounts and transactions,
 * including transfer counterparts. Returns empty arrays if no valid
 * transactions remain after filtering.
 */

export const applyAccountChange = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  accountId: AccountId,
  transactionIds: TransactionId[],
  normalTransactions: DomainNormalTransaction[],
  allTransferTransactions: DomainTransferTransaction[]
): Promise<ApplyAccountChangeResult> => {
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

  if (transactionIdsToUpdate.length === 0) return noOpResult;

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

  const affectedTransferIds = new Set<TransactionId>();

  for (const transfer of preUpdateTransfers) {
    affectedTransferIds.add(transfer.id);
    affectedTransferIds.add(transfer.transferTransactionId);
  }

  const preUpdateAffectedTransfers = allTransferTransactions.filter((t) =>
    affectedTransferIds.has(t.id)
  );

  const accountIds = new Set<AccountId>([
    targetAccountId,
    ...preUpdateNormals.map(({ accountId }) => accountId),
    ...preUpdateAffectedTransfers.map(({ accountId }) => accountId),
    ...updatedTransactions.map(({ accountId }) => accountId),
    ...updatedAllTransferTransactions.map(({ accountId }) => accountId),
  ]);

  await accountService.refreshDeletableStatus(tx, [...accountIds]);

  const updatedAccounts = await accountService.getAccountsByIds(tx, userId, [
    ...accountIds,
  ]);

  return {
    updatedAccounts,
    updatedTransactions: [
      ...updatedTransactions,
      ...updatedAllTransferTransactions,
    ],
  };
};
