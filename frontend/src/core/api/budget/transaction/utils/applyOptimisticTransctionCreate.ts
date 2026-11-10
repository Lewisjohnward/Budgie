import {
  AccountBranded,
  PayeeBranded,
  TransactionBranded,
  TransactionNormal,
  TransactionTransfer,
} from "@/core/types/NormalizedData";
import { addMoney } from "@/core/utils/money";
import {
  AccountId,
  PayeeId,
  TransactionId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";
import { Draft } from "immer";
import { CreateTransactionInput } from "../types";
import { CategoryBranded } from "@/pages/budget/account/components/transactionEditorRow/selectCategory/useSelectCategory";

export type TransactionCreateDraft = {
  accounts: Record<AccountId, Pick<AccountBranded, "balance">>;
  categories: {
    uncategorised: Pick<CategoryBranded, "id">;
  };
  payees: Record<
    PayeeId,
    Pick<
      PayeeBranded,
      "id" | "automaticallyCategorisePayee" | "defaultCategoryId"
    >
  >;
  transactions: Record<
    TransactionId,
    | Pick<
        TransactionNormal,
        | "id"
        | "accountId"
        | "type"
        | "categoryId"
        | "payeeId"
        | "date"
        | "memo"
        | "inflow"
        | "outflow"
      >
    | Pick<
        TransactionTransfer,
        | "id"
        | "accountId"
        | "type"
        | "payeeId"
        | "date"
        | "memo"
        | "inflow"
        | "outflow"
        | "transferTransactionId"
        | "transferAccountId"
      >
  >;
};

export const applyOptimisticTransactionCreate = (
  draft: Draft<TransactionCreateDraft>,
  transactionInput: CreateTransactionInput
): TransactionId[] => {
  const isTransfer = Boolean(transactionInput.transferAccountId);

  const destinationTransactionId = isTransfer
    ? asTransactionId(crypto.randomUUID())
    : undefined;

  const sourceTransactionId = asTransactionId(crypto.randomUUID());

  const optimisticTransactionIds: TransactionId[] = [
    sourceTransactionId,
    ...(destinationTransactionId ? [destinationTransactionId] : []),
  ];

  const inflow = Number(transactionInput.inflow ?? "0");
  const outflow = Number(transactionInput.outflow ?? "0");

  const date = transactionInput.date ?? new Date().toISOString();
  const memo = transactionInput.memo ?? "";

  const sourceAccount = draft.accounts[transactionInput.accountId];

  if (sourceAccount) {
    sourceAccount.balance = addMoney(sourceAccount.balance, inflow, -outflow);
  }

  if (isTransfer && transactionInput.transferAccountId) {
    const destinationAccount =
      draft.accounts[transactionInput.transferAccountId];

    if (destinationAccount) {
      destinationAccount.balance = addMoney(
        destinationAccount.balance,
        outflow,
        -inflow
      );
    }

    const sourceTransaction: TransactionBranded = {
      type: "transfer",
      id: sourceTransactionId,
      accountId: transactionInput.accountId,
      payeeId: null,
      date,
      memo,
      inflow,
      outflow,
      transferAccountId: transactionInput.transferAccountId,
      transferTransactionId: destinationTransactionId!,
    };

    const destinationTransaction: TransactionBranded = {
      type: "transfer",
      id: destinationTransactionId!,
      accountId: transactionInput.transferAccountId,
      payeeId: null,
      date,
      memo,
      inflow: outflow,
      outflow: inflow,
      transferAccountId: transactionInput.accountId,
      transferTransactionId: sourceTransactionId,
    };

    draft.transactions[sourceTransactionId] = sourceTransaction;

    draft.transactions[destinationTransactionId!] = destinationTransaction;
  } else {
    const payee = transactionInput.payeeId
      ? draft.payees[transactionInput.payeeId]
      : undefined;

    const categoryId =
      transactionInput.categoryId ??
      (payee?.automaticallyCategorisePayee ? payee.defaultCategoryId : null) ??
      draft.categories.uncategorised.id;

    const optimisticTransaction: TransactionBranded = {
      type: "normal",
      id: sourceTransactionId,
      accountId: transactionInput.accountId,
      categoryId,
      payeeId: transactionInput.payeeId ?? null,
      date,
      memo,
      inflow,
      outflow,
    };

    draft.transactions[sourceTransactionId] = optimisticTransaction;
  }

  return optimisticTransactionIds;
};
