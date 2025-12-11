import { NormalTransactionEntity } from "../transaction.types";

export function splitTransactionsByType(
  transactions: NormalTransactionEntity[],
  rtaCategoryId: string
) {
  const rtaTransactions = [];
  const nonRtaTransactions = [];
  const transferTransactions = [];

  for (const t of transactions) {
    if (t.categoryId === rtaCategoryId) {
      rtaTransactions.push(t);
    } else if (t.transferTransactionId) {
      transferTransactions.push(t);
    } else {
      nonRtaTransactions.push(t);
    }
  }

  return { rtaTransactions, nonRtaTransactions, transferTransactions };
}
