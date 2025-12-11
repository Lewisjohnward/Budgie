import { roundToStartOfMonth } from "../../../../shared/utils/roundToStartOfMonth";
import { NormalTransactionEntity } from "../../transaction/transaction.types";

export const roundTransactionsToStartOfMonth = (
  transactions: NormalTransactionEntity[]
): NormalTransactionEntity[] => {
  return transactions.map((t) => ({
    ...t,
    date: roundToStartOfMonth(t.date),
  }));
};
