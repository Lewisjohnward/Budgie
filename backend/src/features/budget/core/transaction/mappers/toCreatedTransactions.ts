import { TransferPairNotFoundError } from "../transaction.errors";
import {
  type DomainNormalTransaction,
  type DomainTransferTransaction,
  type CreatedTransactions,
  type TransactionId,
} from "../transaction.types";

/**
 * Groups created transaction records into their logical transaction representations.
 *
 * Normal transactions are mapped individually, while transfer transactions
 * are grouped with their corresponding counterpart using `transferTransactionId`.
 * Each transfer pair is included only once.
 *
 * @param normalTransactions - The created normal transactions.
 * @param transferTransactions - The created transfer transactions, including
 * their linked counterparts.
 * @returns The created normal transactions and transfer pairs.
 * @throws {TransferPairNotFoundError} If a transfer counterpart cannot be found.
 */
export const toCreatedTransactions = (
  normalTransactions: DomainNormalTransaction[],
  transferTransactions: DomainTransferTransaction[]
): CreatedTransactions[] => {
  const createdNormalGroups: CreatedTransactions[] = normalTransactions.map(
    (transaction) => ({
      type: "normal",
      transaction,
    })
  );

  const transferMap = new Map(
    transferTransactions.map((transaction) => [transaction.id, transaction])
  );

  const processedIds = new Set<TransactionId>();
  const createdTransferGroups: CreatedTransactions[] = [];

  for (const transaction of transferTransactions) {
    if (processedIds.has(transaction.id)) continue;

    const counterpart = transferMap.get(transaction.transferTransactionId);

    if (!counterpart) {
      throw new TransferPairNotFoundError({
        transactionId: transaction.id,
        transferTransactionId: transaction.transferTransactionId,
      });
    }

    processedIds.add(transaction.id);
    processedIds.add(counterpart.id);

    createdTransferGroups.push({
      type: "transfer",
      source: transaction,
      destination: counterpart,
    });
  }

  return [...createdNormalGroups, ...createdTransferGroups];
};
