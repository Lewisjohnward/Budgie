/**
 * Filters out transfer transactions that would violate account-change invariants.
 *
 * A transfer transaction is excluded from the update if:
 * - The user selected both sides of the same transfer pair, or
 * - The target account is the transfer's counterpart account
 *   (`targetAccountId === transferAccountId`), which would result in an
 *   invalid or self-referential transfer.
 *
 * This function is pure and does not perform any side effects. It is intended
 * to be used as a defensive step before applying accountId updates.
 *
 * @param transactionIds All transaction ids selected by the user.
 * @param selectedTransferTransactions Transfer transactions among the selected ids.
 * @param targetAccountId The account id transactions are being moved to.
 *
 * @returns A filtered list of transaction ids that can be safely updated
 *          without violating transfer invariants.
 */

import { TransferTransactionEntity } from "../../../../transaction.types";

export const filterInvalidBulkEditTransfers = (
  transactionIds: string[],
  selectedTransferTransactions: TransferTransactionEntity[],
  targetAccountId: string
): string[] => {
  if (selectedTransferTransactions.length === 0) {
    return transactionIds;
  }

  const selectedIds = new Set(transactionIds);
  const excludedTransferIds = new Set<string>();

  for (const t of selectedTransferTransactions) {
    const userSelectedBothSides = selectedIds.has(t.transferTransactionId);
    const movingToCounterpartAccount = targetAccountId === t.transferAccountId;

    if (userSelectedBothSides || movingToCounterpartAccount) {
      excludedTransferIds.add(t.id);
    }
  }

  return transactionIds.filter((id) => !excludedTransferIds.has(id));
};
