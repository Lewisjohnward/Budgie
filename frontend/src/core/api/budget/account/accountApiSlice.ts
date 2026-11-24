import { apiSlice } from "../../apiSlice";
import { CreateAccountInput, CreateAccountResult } from "./types";
import { toCreateAccountRequest } from "./mappers/toRequest";
import { toCreateAccountResult } from "./mappers/toResponse";
import { budgetSnapshotSlice } from "../budgetSnapshotSlice";
import { applyOptimisticAccountCreate } from "./utils/applyOptimisticAccountCreate";
import { AccountId } from "@/pages/budget/allocation/types/types";

export const accountApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addAccount: builder.mutation<CreateAccountResult, CreateAccountInput>({
      query: (input) => ({
        url: "/budget/account",
        method: "POST",
        body: toCreateAccountRequest(input),
      }),

      transformResponse: toCreateAccountResult,

      async onQueryStarted(input, { dispatch, queryFulfilled }) {
        let optimisticAccountId: AccountId;

        const optimisticPatch = dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              optimisticAccountId = applyOptimisticAccountCreate(draft, input);
            }
          )
        );

        let data: CreateAccountResult;

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
              delete draft.accounts[optimisticAccountId];

              const account = data.created.account;
              draft.accounts[account.id] = account;

              if (data.created.transaction) {
                const transaction = data.created.transaction;
                draft.transactions[transaction.id] = transaction;
              }

              for (const month of Object.values(data.updated.months)) {
                draft.months[month.id] = month;
              }
            }
          )
        );
      },
    }),
    deleteAccount: builder.mutation<void, { accountId: string }>({
      query: (accountId) => ({
        url: `/budget/account`,
        method: "DELETE",
        body: accountId,
      }),
      invalidatesTags: ["Bootstrap"],
    }),
    editAccount: builder.mutation<void, any>({
      query: (accountId) => ({
        url: `/budget/account`,
        method: "DELETE",
        body: accountId,
      }),
      invalidatesTags: ["Bootstrap"],
    }),
  }),
});

export const {
  useAddAccountMutation,
  useDeleteAccountMutation,
  useEditAccountMutation,
} = accountApiSlice;
