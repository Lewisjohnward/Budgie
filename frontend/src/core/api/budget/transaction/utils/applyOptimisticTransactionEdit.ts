import { BudgetSnapshot } from "@/core/types/NormalizedData";
import { addMoney } from "@/core/utils/money";
import {
  AccountId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";
import { Draft } from "immer";
import { EditTransactionInput } from "../types";

export const applyOptimisticTransactionEdit = (
  draft: Draft<BudgetSnapshot>,
  transactionId: TransactionId,
  updates: EditTransactionInput["updates"]
): void => {
  const transaction = draft.transactions[transactionId];

  if (!transaction) return;

  let counterpart =
    transaction.type === "transfer"
      ? draft.transactions[transaction.transferTransactionId]
      : undefined;

  if (counterpart?.type !== "transfer") {
    counterpart = undefined;
  }

  const accountBalanceDelta = new Map<AccountId, number>();

  const addBalanceDelta = (
    accountId: AccountId,
    inflow: number,
    outflow: number
  ) => {
    const currentDelta = accountBalanceDelta.get(accountId) ?? 0;

    accountBalanceDelta.set(
      accountId,
      addMoney(currentDelta, inflow, -outflow)
    );
  };

  addBalanceDelta(
    transaction.accountId,
    -transaction.inflow,
    -transaction.outflow
  );

  if (counterpart) {
    addBalanceDelta(
      counterpart.accountId,
      -counterpart.inflow,
      -counterpart.outflow
    );
  }

  const newInflow = addMoney(0, updates.inflow ?? transaction.inflow);

  const newOutflow = addMoney(0, updates.outflow ?? transaction.outflow);

  if (updates.date !== undefined) {
    transaction.date = updates.date;

    if (counterpart) counterpart.date = updates.date;
  }

  if (updates.memo !== undefined) {
    transaction.memo = updates.memo;

    if (counterpart) counterpart.memo = updates.memo;
  }

  transaction.inflow = newInflow;
  transaction.outflow = newOutflow;

  if (counterpart) {
    counterpart.inflow = newOutflow;
    counterpart.outflow = newInflow;
  }

  if (updates.accountId !== undefined) {
    transaction.accountId = updates.accountId;

    if (counterpart) {
      counterpart.transferAccountId = updates.accountId;
    }
  }

  if (transaction.type === "transfer" && updates.transferAccountId != null) {
    transaction.transferAccountId = updates.transferAccountId;

    if (counterpart) {
      counterpart.accountId = updates.transferAccountId;
      counterpart.transferAccountId = transaction.accountId;
    }
  }

  if (transaction.type === "normal") {
    if (updates.categoryId !== undefined) {
      transaction.categoryId = updates.categoryId;
    }

    if (updates.payeeId !== undefined) {
      transaction.payeeId = updates.payeeId;
    }
  }

  addBalanceDelta(
    transaction.accountId,
    transaction.inflow,
    transaction.outflow
  );

  if (counterpart) {
    addBalanceDelta(
      counterpart.accountId,
      counterpart.inflow,
      counterpart.outflow
    );
  }

  for (const [accountId, balanceDelta] of accountBalanceDelta) {
    const account = draft.accounts[accountId];

    if (!account) continue;

    account.balance = addMoney(account.balance, balanceDelta);
  }
};
