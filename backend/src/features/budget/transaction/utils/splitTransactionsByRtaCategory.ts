import { Transaction } from "@prisma/client";

export function splitTransactionsByRtaCategory(
  transactions: Transaction[],
  rtaCategoryId: string,
) {
  const rtaTransactions = [];
  const categorisedTransactions = [];

  for (const t of transactions) {
    if (t.categoryId === rtaCategoryId) {
      rtaTransactions.push(t);
    } else {
      categorisedTransactions.push(t);
    }
  }

  return { rtaTransactions, categorisedTransactions };
}
