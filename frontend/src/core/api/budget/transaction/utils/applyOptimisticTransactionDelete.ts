import {
  AccountBranded,
  TransactionNormal,
  TransactionTransfer,
} from "@/core/types/NormalizedData";
import { addMoney } from "@/core/utils/money";
import {
  AccountId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";
import { Draft } from "immer";

export type TransactionDeleteDraft = {
  accounts: Record<AccountId, Pick<AccountBranded, "balance">>;

  transactions: Record<
    TransactionId,
    | Pick<
        TransactionNormal,
        "id" | "accountId" | "type" | "inflow" | "outflow"
      >
    | Pick<
        TransactionTransfer,
        | "id"
        | "accountId"
        | "type"
        | "inflow"
        | "outflow"
        | "transferTransactionId"
      >
  >;
};

export const applyOptimisticTransactionsDelete = (
  draft: Draft<TransactionDeleteDraft>,
  transactionIds: TransactionId[]
): void => {
  const idsToDelete = new Set<TransactionId>();
  const accountBalanceDelta = new Map<AccountId, number>();

  for (const transactionId of transactionIds) {
    const transaction = draft.transactions[transactionId];

    if (!transaction || idsToDelete.has(transaction.id)) continue;

    idsToDelete.add(transaction.id);

    if (transaction.type === "transfer") {
      const counterpart = draft.transactions[transaction.transferTransactionId];

      if (counterpart && counterpart.type === "transfer") {
        idsToDelete.add(counterpart.id);
      }
    }
  }

  for (const transactionId of idsToDelete) {
    const transaction = draft.transactions[transactionId];

    if (!transaction) continue;

    const currentDelta = accountBalanceDelta.get(transaction.accountId) ?? 0;

    accountBalanceDelta.set(
      transaction.accountId,
      addMoney(currentDelta, -transaction.inflow, transaction.outflow)
    );

    delete draft.transactions[transactionId];
  }

  for (const [accountId, balanceDelta] of accountBalanceDelta) {
    const account = draft.accounts[accountId];

    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    account.balance = addMoney(account.balance, balanceDelta);
  }
};
