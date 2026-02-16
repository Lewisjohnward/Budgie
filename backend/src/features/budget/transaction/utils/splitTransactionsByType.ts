import { type DomainNormalTransaction } from "../transaction.types";

// TODO:(lewis 2026-02-10 13:49) needs a jsdoc
export function splitTransactionsByType(
  transactions: DomainNormalTransaction[],
  rtaCategoryId: string

  // TODO:(lewis 2026-02-10 13:49) needs a return type
) {
  const rtaTransactions = [];
  const nonRtaTransactions = [];

  for (const t of transactions) {
    if (t.categoryId === rtaCategoryId) {
      rtaTransactions.push(t);
    } else {
      nonRtaTransactions.push(t);
    }
  }

  return { rtaTransactions, nonRtaTransactions };
}
