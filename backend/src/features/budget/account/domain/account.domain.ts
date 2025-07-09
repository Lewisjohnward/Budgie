/**
 * Adjusts account balance when adding / deleting transactions.
 */

import { Transaction } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ZERO } from "../../../../shared/constants/zero";
import { OperationMode } from "../../../../shared/enums/operation-mode";

type BalanceChangeMap = { [accountId: string]: Decimal };

export const calculateBalanceChangePerAccount = (
  transactions: Transaction[],
  mode: OperationMode,
) => {
  return transactions.reduce((acc: BalanceChangeMap, transaction) => {
    const accountId = transaction.accountId;
    const baseChange = transaction.outflow.sub(transaction.inflow);

    const change = mode === OperationMode.Add ? baseChange.neg() : baseChange;

    acc[accountId] = (acc[accountId] ?? ZERO).add(change);
    return acc;
  }, {});
};
