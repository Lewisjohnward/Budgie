import { v4 as uuidv4 } from "uuid";
import { TransferTransactionEntity } from "../transaction.types";

/**
 * Duplicates transfer transactions while maintaining their bidirectional relationships.
 *
 * This function handles:
 * 1. Assigning new UUIDs to new transactions to be created
 * 2. Maintaining a mapping of original IDs to new transactions
 * 3. Updating transferTransactionId references to point to the new IDs
 * 4. Cleaning up temporary properties
 *
 * This is necessary when duplicating transfer transactions because they have
 * bidirectional relationships (transferTransactionId) that must be preserved
 * with the new transaction IDs.
 *
 * @param transactions - Array of transfer transactions to duplicate (typically includes pairs)
 * @returns Array of duplicated transfer transactions with new IDs and updated transferTransactionId references
 *
 * @example
 * const originalTxs = [
 *   { id: 'tx-1', transferTransactionId: 'tx-2', ... },
 *   { id: 'tx-2', transferTransactionId: 'tx-1', ... }
 * ];
 *
 * const duplicated = duplicateTransferTransactions(originalTxs);
 * // Result: [
 * //   { id: 'new-uuid-1', transferTransactionId: 'new-uuid-2', ... },
 * //   { id: 'new-uuid-2', transferTransactionId: 'new-uuid-1', ... }
 * // ]
 */
export function duplicateTransferTransactions(
  transactions: TransferTransactionEntity[]
): TransferTransactionEntity[] {
  if (transactions.length === 0) {
    return [];
  }

  // First pass: assign new UUIDs to all transactions and keep track of original IDs
  const transactionsWithIds = transactions.map((originalTx) => {
    const newId = uuidv4();
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
