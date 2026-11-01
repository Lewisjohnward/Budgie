import { CreateTransactionResponse } from "@/core/types/exported-types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import {
  CreateTransactionInput,
  CreateTransactionResult,
  EditBulkTransactionsInput,
  EditBulkTransactionsResult,
} from "./types";
import {
  asAccountId,
  asMonthId,
  asTransactionId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";
import { mapMonth } from "../mappers/monthMapper";
import { mapTransaction } from "../mappers/transactionMapper";
import { mapMemo } from "../mappers/memoMapper";
import { mapPayee } from "../mappers/payeeMapper";
import { mapAccount } from "../mappers/accountMapper";
import { TransactionBranded } from "@/core/types/NormalizedData";
import { addMoney, subtractMoney } from "@/core/utils/money";

const TRANSACTION_ENDPOINT_URL = "/budget/transaction";

export const transactionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation<
      CreateTransactionResult,
      CreateTransactionInput
    >({
      query: (transaction) => ({
        url: TRANSACTION_ENDPOINT_URL,
        method: "POST",
        body: transaction,
      }),

      transformResponse: (
        response: CreateTransactionResponse
      ): CreateTransactionResult => ({
        created: {
          transactions:
            response.created.transactions.type === "normal"
              ? {
                type: "normal" as const,
                transaction: mapTransaction(
                  response.created.transactions.transaction
                ),
              }
              : {
                type: "transfer" as const,
                source: mapTransaction(response.created.transactions.source),
                destination: mapTransaction(
                  response.created.transactions.destination
                ),
              },
          ...(response.created.payee
            ? { payee: mapPayee(response.created.payee) }
            : {}),
          memos: response.created.memos.map(mapMemo),
          months: Object.fromEntries(
            Object.entries(response.created.months).map(([id, month]) => [
              asMonthId(id),
              mapMonth(month),
            ])
          ),
        },
        updated: {
          accounts: Object.fromEntries(
            Object.entries(response.updated.accounts).map(([id, account]) => [
              asAccountId(id),
              mapAccount(account),
            ])
          ),
          months: Object.fromEntries(
            Object.entries(response.updated.months).map(([id, month]) => [
              asMonthId(id),
              mapMonth(month),
            ])
          ),
        },
      }),

      async onQueryStarted(transaction, { dispatch, queryFulfilled }) {
        const sourceTransactionId = asTransactionId(crypto.randomUUID());

        const isTransfer = Boolean(transaction.transferAccountId);

        const destinationTransactionId = isTransfer
          ? asTransactionId(crypto.randomUUID())
          : undefined;

        const optimisticTransactionIds: TransactionId[] = [
          sourceTransactionId,
          ...(destinationTransactionId ? [destinationTransactionId] : []),
        ];

        const inflow = Number(transaction.inflow ?? "0");
        const outflow = Number(transaction.outflow ?? "0");

        const date = transaction.date ?? new Date().toISOString();
        const memo = transaction.memo ?? "";

        const optimisticPatch = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              const sourceAccount = draft.accounts[transaction.accountId];

              if (sourceAccount) {
                sourceAccount.balance = addMoney(
                  sourceAccount.balance,
                  inflow,
                  -outflow
                );
              }

              if (isTransfer && transaction.transferAccountId) {
                const destinationAccount =
                  draft.accounts[transaction.transferAccountId];

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
                  accountId: transaction.accountId,
                  payeeId: null,
                  date,
                  memo,
                  inflow,
                  outflow,
                  transferAccountId: transaction.transferAccountId,
                  transferTransactionId: destinationTransactionId!,
                };

                const destinationTransaction: TransactionBranded = {
                  type: "transfer",
                  id: destinationTransactionId!,
                  accountId: transaction.transferAccountId,
                  payeeId: null,
                  date,
                  memo,
                  inflow: outflow,
                  outflow: inflow,
                  transferAccountId: transaction.accountId,
                  transferTransactionId: sourceTransactionId,
                };

                draft.transactions[sourceTransactionId] = sourceTransaction;

                draft.transactions[destinationTransactionId!] =
                  destinationTransaction;

                return;
              }

              const payee = transaction.payeeId
                ? draft.payees[transaction.payeeId]
                : undefined;

              const categoryId =
                transaction.categoryId ??
                (payee?.automaticallyCategorisePayee
                  ? payee.defaultCategoryId
                  : null) ??
                draft.categories.uncategorised.id;

              const optimisticTransaction: TransactionBranded = {
                type: "normal",
                id: sourceTransactionId,
                accountId: transaction.accountId,
                categoryId,
                payeeId: transaction.payeeId ?? null,
                date,
                memo,
                inflow,
                outflow,
              };

              draft.transactions[sourceTransactionId] = optimisticTransaction;
            }
          )
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            budgetSnapshotSlice.util.updateQueryData(
              "getBudgetSnapshot",
              undefined,
              (draft) => {
                // Remove the optimistic transaction(s).
                for (const id of optimisticTransactionIds) {
                  delete draft.transactions[id];
                }

                // Insert the authoritative transaction(s).
                if (data.created.transactions.type === "normal") {
                  const transaction = data.created.transactions.transaction;

                  draft.transactions[transaction.id] = transaction;
                } else {
                  const { source, destination } = data.created.transactions;

                  draft.transactions[source.id] = source;
                  draft.transactions[destination.id] = destination;
                }

                // Apply authoritative account balances.
                for (const account of Object.values(data.updated.accounts)) {
                  draft.accounts[account.id] = account;
                }

                // Apply created months.
                for (const month of Object.values(data.created.months)) {
                  draft.months[month.id] = month;
                }

                // Apply updated months.
                for (const month of Object.values(data.updated.months)) {
                  draft.months[month.id] = month;
                }

                // Apply the payee if the server created one.
                if (data.created.payee) {
                  draft.payees[data.created.payee.id] = data.created.payee;
                }

                // Apply returned monthly memos.
                for (const memo of data.created.memos) {
                  draft.notesByMonth[memo.month] = memo;
                }
              }
            )
          );
        } catch {
          optimisticPatch.undo();
        }
      },
      invalidatesTags: ["Accounts", "Categories"],
    }),
    editTransaction: builder.mutation<any, any>({
      query: (transaction) => ({
        url: "/budget/transaction",
        method: "PATCH",
        body: transaction,
      }),
      invalidatesTags: ["Accounts", "Categories", "Bootstrap"],
    }),
    deleteTransaction: builder.mutation<any, any>({
      query: (transaction) => ({
        url: "/budget/transaction",
        method: "DELETE",
        body: transaction,
      }),
      invalidatesTags: ["Accounts", "Categories", "Bootstrap"],
    }),
    duplicateTransactions: builder.mutation<any, any>({
      query: (transactions) => ({
        url: "/budget/transaction/duplicate",
        method: "POST",
        body: transactions,
      }),
      invalidatesTags: ["Accounts", "Categories", "Bootstrap"],
    }),
    editBulkTransactions: builder.mutation<
      EditBulkTransactionsResult,
      EditBulkTransactionsInput
    >({
      query: (mutation) => ({
        url: `${TRANSACTION_ENDPOINT_URL}/bulk`,
        method: "PATCH",
        body: mutation,
      }),

      async onQueryStarted(mutation, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
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

                  const amount = subtractMoney(
                    transaction.inflow,
                    transaction.outflow
                  );

                  const oldAccount = draft.accounts[oldAccountId];
                  const newAccount = draft.accounts[newAccountId];

                  if (oldAccount) {
                    oldAccount.balance = subtractMoney(
                      oldAccount.balance,
                      amount
                    );
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
            }
          )
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            budgetSnapshotSlice.util.updateQueryData(
              "getBudgetSnapshot",
              undefined,
              (draft) => {
                Object.assign(draft.transactions, data.updated.transactions);
                Object.assign(draft.accounts, data.updated.accounts);
                Object.assign(draft.months, data.updated.months);
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useCreateTransactionMutation,
  useEditTransactionMutation,
  useDeleteTransactionMutation,
  useDuplicateTransactionsMutation,
  useEditBulkTransactionsMutation,
} = transactionApiSlice;
