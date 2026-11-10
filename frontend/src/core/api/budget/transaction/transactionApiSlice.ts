import {
  CreateTransactionResponse,
  DeleteTransactionsResponse,
  DuplicateTransactionsResponse,
  EditTransactionResponse,
} from "@/core/types/exported-types";
import { apiSlice } from "../../apiSlice";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import {
  CreateTransactionInput,
  CreateTransactionResult,
  DeleteTransactionsInput,
  DeleteTransactionsResult,
  DuplicateTransactionsInput,
  DuplicateTransactionsResult,
  EditBulkTransactionsInput,
  EditBulkTransactionsResult,
  EditTransactionInput,
  EditTransactionResult,
} from "./types";
import {
  asAccountId,
  asMonthId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";
import { mapMonth } from "../mappers/monthMapper";
import { mapTransaction } from "../mappers/transactionMapper";
import { mapMemo } from "../mappers/memoMapper";
import { mapPayee } from "../mappers/payeeMapper";
import { mapAccount } from "../mappers/accountMapper";
import { applyOptimisticTransactionsBulkEdit } from "./utils/applyOptimisticTransactionsBulkEdit";
import { applyOptimisticTransactionCreate } from "./utils/applyOptimisticTransctionCreate";
import { applyOptimisticTransactionsDelete } from "./utils/applyOptimisticTransactionDelete";
import { applyOptimisticTransactionEdit } from "./utils/applyOptimisticTransactionEdit";
import { applyOptimisticTransactionsDuplicate } from "./utils/applyOptimisticTransactionsDuplicate";

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
        let optimisticTransactionIds: TransactionId[];

        const optimisticPatch = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              optimisticTransactionIds = applyOptimisticTransactionCreate(
                draft,
                transaction
              );
            }
          )
        );

        let data: CreateTransactionResult;

        try {
          ({ data } = await queryFulfilled);
        } catch {
          optimisticPatch.undo();
          return;
        }

        dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              for (const id of optimisticTransactionIds) {
                delete draft.transactions[id];
              }

              if (data.created.transactions.type === "normal") {
                const transaction = data.created.transactions.transaction;

                draft.transactions[transaction.id] = transaction;
              } else {
                const { source, destination } = data.created.transactions;

                draft.transactions[source.id] = source;
                draft.transactions[destination.id] = destination;
              }

              for (const account of Object.values(data.updated.accounts)) {
                draft.accounts[account.id] = account;
              }

              for (const month of Object.values(data.created.months)) {
                draft.months[month.id] = month;
              }

              for (const month of Object.values(data.updated.months)) {
                draft.months[month.id] = month;
              }

              if (data.created.payee) {
                draft.payees[data.created.payee.id] = data.created.payee;
              }

              for (const memo of data.created.memos) {
                draft.notesByMonth[memo.month] = memo;
              }
            }
          )
        );
      },
      invalidatesTags: ["Accounts", "Categories"],
    }),
    editTransaction: builder.mutation<
      EditTransactionResult,
      EditTransactionInput
    >({
      query: ({ transactionId, updates }) => ({
        url: `${TRANSACTION_ENDPOINT_URL}/${transactionId}`,
        method: "PATCH",
        body: updates,
      }),

      invalidatesTags: ["Accounts", "Categories"],

      transformResponse: (
        response: EditTransactionResponse
      ): EditTransactionResult => ({
        created: {
          payee: Object.fromEntries(
            Object.entries(response.created.payee).map(([id, payee]) => [
              id,
              mapPayee(payee),
            ])
          ),
          months: Object.fromEntries(
            Object.entries(response.created.months).map(([id, month]) => [
              asMonthId(id),
              mapMonth(month),
            ])
          ),
          memos: Object.fromEntries(
            Object.entries(response.created.memos).map(([id, memo]) => [
              id,
              mapMemo(memo),
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
          transactions: Object.fromEntries(
            Object.entries(response.updated.transactions).map(
              ([id, transaction]) => [
                id as TransactionId,
                mapTransaction(transaction),
              ]
            )
          ),
        },
      }),

      async onQueryStarted(
        { transactionId, updates },
        { dispatch, queryFulfilled }
      ) {
        const optimisticPatch = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              applyOptimisticTransactionEdit(draft, transactionId, updates);
            }
          )
        );

        let data: EditTransactionResult;

        try {
          ({ data } = await queryFulfilled);
        } catch {
          optimisticPatch.undo();
          return;
        }

        dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              Object.assign(draft.payees, data.created.payee);
              Object.assign(draft.accounts, data.updated.accounts);
              Object.assign(draft.months, data.created.months);
              Object.assign(draft.months, data.updated.months);
              Object.assign(draft.transactions, data.updated.transactions);

              for (const memo of Object.values(data.created.memos)) {
                draft.notesByMonth[memo.month] = memo;
              }
            }
          )
        );
      },
    }),
    deleteTransactions: builder.mutation<
      DeleteTransactionsResult,
      DeleteTransactionsInput
    >({
      query: (transactions) => ({
        url: TRANSACTION_ENDPOINT_URL,
        method: "DELETE",
        body: transactions,
      }),
      invalidatesTags: ["Accounts", "Categories"],

      transformResponse: (
        response: DeleteTransactionsResponse
      ): DeleteTransactionsResult => ({
        deleted: {
          transactions: Object.fromEntries(
            Object.entries(response.deleted.transactions).map(
              ([id, transaction]) => [
                id as TransactionId,
                mapTransaction(transaction),
              ]
            )
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

      async onQueryStarted(input, { dispatch, queryFulfilled }) {
        const optimisticPatch = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              applyOptimisticTransactionsDelete(draft, input.transactionIds);
            }
          )
        );

        let data: DeleteTransactionsResult;

        try {
          ({ data } = await queryFulfilled);
        } catch {
          optimisticPatch.undo();
          return;
        }

        dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              for (const transaction of Object.values(
                data.deleted.transactions
              )) {
                delete draft.transactions[transaction.id];
              }

              Object.assign(draft.accounts, data.updated.accounts);
              Object.assign(draft.months, data.updated.months);
            }
          )
        );
      },
    }),
    duplicateTransactions: builder.mutation<
      DuplicateTransactionsResult,
      DuplicateTransactionsInput
    >({
      query: (transactions) => ({
        url: "/budget/transaction/duplicate",
        method: "POST",
        body: transactions,
      }),
      invalidatesTags: ["Accounts", "Categories"],

      transformResponse: (
        response: DuplicateTransactionsResponse
      ): DuplicateTransactionsResult => ({
        created: {
          transactions: response.created.transactions.map((t) => {
            if (t.type === "normal") {
              return {
                type: "normal" as const,
                transaction: mapTransaction(t.transaction),
              };
            }
            if (t.type === "transfer") {
              return {
                type: "transfer" as const,
                source: mapTransaction(t.source),
                destination: mapTransaction(t.destination),
              };
            }
          }),
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

      async onQueryStarted(input, { dispatch, queryFulfilled }) {
        let optimisticTransactionIds: TransactionId[];

        const optimisticPatch = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              optimisticTransactionIds = applyOptimisticTransactionsDuplicate(
                draft,
                input.transactionIds
              );
            }
          )
        );

        let data: DuplicateTransactionsResult;

        try {
          ({ data } = await queryFulfilled);
        } catch {
          optimisticPatch.undo();
          return;
        }

        dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              for (const id of optimisticTransactionIds) {
                delete draft.transactions[id];
              }

              for (const transactionUnit of data.created.transactions) {
                if (transactionUnit.type === "normal") {
                  draft.transactions[transactionUnit.transaction.id] =
                    transactionUnit.transaction;
                } else {
                  draft.transactions[transactionUnit.source.id] =
                    transactionUnit.source;
                  draft.transactions[transactionUnit.destination.id] =
                    transactionUnit.destination;
                }
              }

              Object.assign(draft.accounts, data.updated.accounts);
              Object.assign(draft.months, data.updated.months);
            }
          )
        );
      },
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
      invalidatesTags: ["Accounts", "Categories"],

      async onQueryStarted(mutation, { dispatch, queryFulfilled }) {
        const optimisticPatch = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              applyOptimisticTransactionsBulkEdit(draft, mutation);
            }
          )
        );

        let data: EditBulkTransactionsResult;

        try {
          ({ data } = await queryFulfilled);
        } catch {
          optimisticPatch.undo();
          return;
        }

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
      },
    }),
  }),
});

export const {
  useCreateTransactionMutation,
  useEditTransactionMutation,
  useDeleteTransactionsMutation,
  useDuplicateTransactionsMutation,
  useEditBulkTransactionsMutation,
} = transactionApiSlice;
