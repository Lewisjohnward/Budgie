import { Transaction } from "@prisma/client";

type BalanceChangeMap = { [accountId: string]: number };

export const calculateBalanceChange = (transactions: Transaction[]) => {
  return transactions.reduce((acc: BalanceChangeMap, transaction) => {
    const accountId = transaction.accountId;
    const inflow = transaction.inflow.toNumber();
    const outflow = transaction.outflow.toNumber();
    const change = outflow - inflow;

    acc[accountId] = (acc[accountId] ?? 0) + change;
    return acc;
  }, {});
};
