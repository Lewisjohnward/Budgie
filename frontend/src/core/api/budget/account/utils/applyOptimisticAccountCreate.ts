import { AccountBranded } from "@/core/types/NormalizedData";
import { AccountId, asAccountId } from "@/pages/budget/allocation/types/types";
import { CreateAccountInput } from "../types";
import { Draft } from "immer";

export type AccountCreateDraft = {
  accounts: Record<
    AccountId,
    Pick<
      AccountBranded,
      "id" | "position" | "name" | "balance" | "type" | "open" | "deletable"
    >
  >;
};

export const applyOptimisticAccountCreate = (
  draft: Draft<AccountCreateDraft>,
  input: CreateAccountInput
): AccountId => {
  const accountId = asAccountId(crypto.randomUUID());

  const accounts = Object.values(draft.accounts);

  const position =
    accounts.length > 0
      ? Math.max(...accounts.map((account) => account.position)) + 1
      : 0;

  draft.accounts[accountId] = {
    id: accountId,
    name: input.name.trim(),
    position,
    balance: input.balance ?? 0,
    type: input.type,
    open: true,
    deletable: true,
  };

  return accountId;
};
