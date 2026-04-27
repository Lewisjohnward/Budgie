import { type AccountId } from "../../../../../account/account.types";
import {
  type TransactionId,
  type DomainTransferTransaction,
} from "../../../../transaction.types";

/**
 * Filters transfer transactions that would violate account-change rules.
 *
 * This function removes transfer transactions from the update list if:
 * 1. Both sides of the same transfer pair were selected by the user.
 * 2. The target account is the transfer's counterpart account
 *    (`targetAccountId === transferAccountId`), which would create an
 *    invalid or self-referential transfer.
 *
 * This is a pure, side-effect-free function intended as a defensive check
 * before performing bulk account updates on transactions.
 *
 * @param transactionIds - All transaction IDs selected by the user for account change.
 * @param selectedTransferTransactions - Transfer transactions among the selected IDs.
 * @param targetAccountId - The account ID that the selected transactions are being moved to.
 *
 * @returns A filtered list of transaction IDs that can safely be updated without
 * violating transfer invariants.
 */
export const filterInvalidBulkEditTransfers = (
  transactionIds: TransactionId[],
  selectedTransferTransactions: DomainTransferTransaction[],
  targetAccountId: AccountId
): TransactionId[] => {
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
