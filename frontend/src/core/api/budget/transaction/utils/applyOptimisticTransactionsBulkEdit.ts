import {
  AccountBranded,
  TransactionNormal,
  TransactionTransfer,
} from "@/core/types/NormalizedData";
import { subtractMoney, addMoney } from "@/core/utils/money";
import { Draft } from "immer";
import { EditBulkTransactionsInput } from "../types";
import {
  AccountId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";

export type TransactionsBulkEditDraft = {
  accounts: Record<AccountId, Pick<AccountBranded, "balance">>;

  transactions: Record<
    TransactionId,
    | Pick<
        TransactionNormal,
        | "id"
        | "accountId"
        | "type"
        | "inflow"
        | "outflow"
        | "categoryId"
        | "memo"
      >
    | Pick<
        TransactionTransfer,
        | "id"
        | "accountId"
        | "type"
        | "inflow"
        | "outflow"
        | "transferTransactionId"
        | "transferAccountId"
        | "memo"
      >
  >;
};

export const applyOptimisticTransactionsBulkEdit = (
  draft: Draft<TransactionsBulkEditDraft>,
  mutation: EditBulkTransactionsInput
): void => {
  const selectedIds = new Set(mutation.transactionIds);

  for (const transactionId of mutation.transactionIds) {
    const transaction = draft.transactions[transactionId];

    if (!transaction) continue;

    if ("accountId" in mutation.updates) {
      const newAccountId = mutation.updates.accountId;
      const oldAccountId = transaction.accountId;

      if (oldAccountId === newAccountId) continue;

      if (transaction.type === "transfer") {
        const counterpart =
          draft.transactions[transaction.transferTransactionId];

        if (
          !counterpart ||
          counterpart.type !== "transfer" ||
          counterpart.accountId === newAccountId ||
          selectedIds.has(counterpart.id)
        ) {
          continue;
        }

        counterpart.transferAccountId = newAccountId;
      }

      const amount = subtractMoney(transaction.inflow, transaction.outflow);

      const oldAccount = draft.accounts[oldAccountId];
      const newAccount = draft.accounts[newAccountId];

      if (oldAccount) {
        oldAccount.balance = subtractMoney(oldAccount.balance, amount);
      }

      if (newAccount) {
        newAccount.balance = addMoney(newAccount.balance, amount);
      }

      transaction.accountId = newAccountId;
      continue;
    }

    if ("categoryId" in mutation.updates) {
      if (transaction.type === "normal") {
        transaction.categoryId = mutation.updates.categoryId;
      }

      continue;
    }

    if ("memo" in mutation.updates) {
      transaction.memo = mutation.updates.memo.trim();
    }
  }
};
