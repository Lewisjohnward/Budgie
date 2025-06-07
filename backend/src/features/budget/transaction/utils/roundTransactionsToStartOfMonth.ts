import { Transaction } from "@prisma/client";
import { roundToStartOfMonth } from "../../../../shared/utils/roundToStartOfMonth";

export const roundTransactionsToStartOfMonth = (
  transactions: (Omit<Transaction, "id"> & { id?: string })[],
) => {
  return transactions.map((t) => ({
    ...t,
    date: roundToStartOfMonth(t.date),
  }));
};
