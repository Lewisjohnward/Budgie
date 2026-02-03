import { ZERO } from "../../../../shared/constants/zero";
import { OperationMode } from "../../../../shared/enums/operation-mode";
import {
  type BalanceChangeMap,
  type BalanceAffectingTransaction,
} from "../application/services/updateAccountBalances";

/**
 * Adjusts account balance when adding / deleting transactions.
 */

export const calculateBalanceChangePerAccount = (
  transactions: BalanceAffectingTransaction[],
  mode: OperationMode
): BalanceChangeMap => {
  return transactions.reduce((acc: BalanceChangeMap, transaction) => {
    const accountId = transaction.accountId;
    const baseChange = transaction.outflow.sub(transaction.inflow);
    const change = mode === OperationMode.Add ? baseChange.neg() : baseChange;

    acc[accountId] = (acc[accountId] ?? ZERO).add(change);
    return acc;
  }, {});
};
