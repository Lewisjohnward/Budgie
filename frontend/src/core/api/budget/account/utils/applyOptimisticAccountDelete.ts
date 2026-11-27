import {
  AccountBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";
import {
  AccountId,
  asAccountId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";
import { CreateAccountInput } from "../types";
import { Draft } from "immer";

export type AccountDeleteDraft = {
  accounts: Record<
    AccountId,
    Pick<
      AccountBranded,
      "id" | "position" | "name" | "balance" | "type" | "open" | "deletable"
    >
  >;
  transactions: Record<
    TransactionId,
    Pick<TransactionBranded, "id" | "accountId">
  >;
};

export const applyOptimisticAccountDelete = (
  draft: Draft<AccountDeleteDraft>,
  accountId: AccountId
): void => {
  const account = draft.accounts[accountId];
  delete draft.accounts[accountId];

  for (const transaction of Object.values(draft.transactions)) {
    if (transaction.accountId === accountId) {
      delete draft.transactions[transaction.id];
    }
  }

  if (account.type === "BANK") {
    for (const otherAccount of Object.values(draft.accounts)) {
      if (
        otherAccount.type === "BANK" &&
        otherAccount.position > account.position
      ) {
        otherAccount.position -= 1;
      }
    }
  }
};
