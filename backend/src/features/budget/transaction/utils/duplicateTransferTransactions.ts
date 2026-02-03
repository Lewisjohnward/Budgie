import { v4 as uuidv4 } from "uuid";
import {
  asTransactionId,
  type DomainTransferTransaction,
} from "../transaction.types";

/**
 * Creates duplicates of transfer transactions while preserving their bidirectional links.
 *
 * - Assigns new UUIDs to each transaction.
 * - Maintains a mapping from original IDs to new transactions.
 * - Updates `transferTransactionId` references to point to the new duplicated transactions.
 * - Sets `createdAt` and `updatedAt` to the current time.
 * - Returns a new array; the original transactions are not mutated.
 *
 * @param transactions - Array of transfer transactions to duplicate (typically includes pairs)
 * @returns Array of duplicated transfer transactions with new IDs and updated `transferTransactionId` references
 *
 * @example
 * const originalTxs = [
 *   { id: 'tx-1', transferTransactionId: 'tx-2', inflow: 100, outflow: 0 },
 *   { id: 'tx-2', transferTransactionId: 'tx-1', inflow: 0, outflow: 100 }
 * ];
 *
 * const duplicated = duplicateTransferTransactions(originalTxs);
 * // Result: [
 * //   { id: 'new-uuid-1', transferTransactionId: 'new-uuid-2', inflow: 100, outflow: 0, createdAt: ..., updatedAt: ... },
 * //   { id: 'new-uuid-2', transferTransactionId: 'new-uuid-1', inflow: 0, outflow: 100, createdAt: ..., updatedAt: ... }
 * // ]
 */
export function duplicateTransferTransactions(
  transactions: DomainTransferTransaction[]
): DomainTransferTransaction[] {
  if (transactions.length === 0) {
    return [];
  }

  // First pass: assign new UUIDs to all transactions and keep track of original IDs
  const transactionsWithIds = transactions.map((originalTx) => {
    const newId = asTransactionId(uuidv4());
    return {
      ...originalTx,
      id: newId,
      originalId: originalTx.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Create a map of original ID to new transaction
  const originalIdToNewTx = new Map(
    transactionsWithIds.map((tx) => [tx.originalId, tx] as const)
  );

  // Second pass: update transferTransactionId references to use the new IDs
  const processedTransactions = transactionsWithIds.map((tx) => {
    const txCopy = { ...tx };
    // If this is a transfer with a paired transaction
    if (txCopy.transferTransactionId) {
      const pairedTx = originalIdToNewTx.get(txCopy.transferTransactionId);
      if (!pairedTx) {
        throw new Error(
          "duplicateTransferTransactions - unable to find a paired transaction"
        );
      }
      txCopy.transferTransactionId = pairedTx.id;
      // If we couldn't find the paired transaction, remove the reference
    }
    // Remove the temporary originalId property
    const { originalId, ...finalTx } = txCopy;
    return finalTx;
  });

  return processedTransactions;
}
