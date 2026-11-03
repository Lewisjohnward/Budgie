import {
  BudgetSnapshot,
  TransactionBranded,
  TransactionTransfer,
} from "@/core/types/NormalizedData";
import { addMoney } from "@/core/utils/money";
import {
  TransactionId,
  AccountId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";
import { Draft } from "immer";

export const applyOptimisticTransactionsDuplicate = (
  draft: Draft<BudgetSnapshot>,
  transactionIds: TransactionId[]
): TransactionId[] => {
  const optimisticTransactionIds: TransactionId[] = [];

  const idsToSkip = new Set<TransactionId>();
  const accountBalanceDelta = new Map<AccountId, number>();

  const addAccountBalanceDelta = (transaction: TransactionBranded) => {
    const oldDelta = accountBalanceDelta.get(transaction.accountId) ?? 0;

    const newDelta = addMoney(
      oldDelta,
      transaction.inflow,
      -transaction.outflow
    );

    accountBalanceDelta.set(transaction.accountId, newDelta);
  };

  for (const transactionId of transactionIds) {
    const transaction = draft.transactions[transactionId];

    if (!transaction || idsToSkip.has(transaction.id)) continue;
    idsToSkip.add(transaction.id);

    if (transaction.type === "transfer") {
      const destinationTransaction =
        draft.transactions[transaction.transferTransactionId];

      // Only duplicate complete transfer pairs, and process each pair once.
      if (
        !destinationTransaction ||
        destinationTransaction.type !== "transfer" ||
        idsToSkip.has(destinationTransaction.id)
      ) {
        continue;
      }

      idsToSkip.add(destinationTransaction.id);

      const tempDestinationId = asTransactionId(crypto.randomUUID());
      const tempSourceId = asTransactionId(crypto.randomUUID());

      optimisticTransactionIds.push(tempSourceId, tempDestinationId);

      const duplicatedDestinationTransaction: TransactionTransfer = {
        ...destinationTransaction,
        id: tempDestinationId,
        transferTransactionId: tempSourceId,
      };

      const duplicatedSourceTransaction: TransactionTransfer = {
        ...transaction,
        id: tempSourceId,
        transferTransactionId: tempDestinationId,
      };

      draft.transactions[tempDestinationId] = duplicatedDestinationTransaction;

      draft.transactions[tempSourceId] = duplicatedSourceTransaction;

      addAccountBalanceDelta(duplicatedDestinationTransaction);
      addAccountBalanceDelta(duplicatedSourceTransaction);
    } else {
      const tempId = asTransactionId(crypto.randomUUID());
      optimisticTransactionIds.push(tempId);

      const duplicatedTransaction: TransactionBranded = {
        ...transaction,
        id: tempId,
      };

      draft.transactions[tempId] = duplicatedTransaction;

      addAccountBalanceDelta(duplicatedTransaction);
    }
  }

  for (const [accountId, balanceDelta] of accountBalanceDelta) {
    const account = draft.accounts[accountId];

    if (!account) continue;

    account.balance = addMoney(account.balance, balanceDelta);
  }
  return optimisticTransactionIds;
};
