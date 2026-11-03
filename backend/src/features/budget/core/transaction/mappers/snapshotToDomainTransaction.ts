import { type TransactionSnapshot } from "../application/use-cases/editTransaction/getTransactionSnapshotWithPair";
import { type DomainTransaction } from "../transaction.types";

/**
 * Converts a transaction snapshot into an array of domain transactions.
 *
 * For normal transactions, returns an array containing only the main transaction.
 * For transfer transactions, returns an array containing both the main transaction
 * and its paired transaction.
 *
 * @param snapshot - The transaction snapshot to convert.
 * @returns An array containing the corresponding domain transaction(s).
 */
export const snapshotToDomainTransaction = (
  snapshot: TransactionSnapshot
): DomainTransaction[] => {
  if (snapshot.isTransfer) {
    return [snapshot.mainTx, snapshot.pairedTx];
  }

  return [snapshot.mainTx];
};
