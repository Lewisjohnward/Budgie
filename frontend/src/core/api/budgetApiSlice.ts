import { AddAccountPayload } from "../types/AccountSchema";
import { NormalizedData } from "../types/NormalizedData";
import { DuplicateTransactions } from "../types/TransactionSchema";
import { apiSlice } from "./apiSlice";
import { AllocationData } from "../types/Allocation";
import { UpdateMonthsPayload } from "@/pages/budget/allocation/components/assign/types/assignTypes";
import { MonthId } from "@/pages/budget/allocation/types/types";
import {
  UpdatedMonthsById,
  updatedMonthsByIdSchema,
} from "../schemas/editMonthSchema";
import { budgetSnapshotSlice } from "./budget/budgetSnapshotSlice";

// TODO:(lewis 2026-04-17 11:14) this file can be split up like user slice and auth slice
export const budgetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<NormalizedData, void>({
      query: () => ({
        url: "budget/account",
        method: "GET",
      }),
      providesTags: ["Accounts"],
    }),
    addAccount: builder.mutation<void, AddAccountPayload>({
      query: (newAccount) => ({
        url: "budget/account",
        method: "POST",
        body: newAccount,
      }),
      invalidatesTags: ["Accounts", "Categories"],
    }),
    deleteAccount: builder.mutation<void, { accountId: string }>({
      query: (accountId) => ({
        url: `budget/account`,
        method: "DELETE",
        body: accountId,
      }),
      invalidatesTags: ["Accounts", "Categories"],
    }),
    // TODO: TYPING
    addTransaction: builder.mutation<any, any>({
      query: (transaction) => ({
        url: "budget/transaction",
        method: "POST",
        body: transaction,
      }),
      invalidatesTags: ["Accounts", "Categories"],
    }),
    duplicateTransactions: builder.mutation<void, DuplicateTransactions>({
      query: (transactions) => ({
        url: "budget/transaction/duplicate",
        method: "POST",
        body: transactions,
      }),
      invalidatesTags: ["Accounts", "Categories"],
    }),
    deleteTransaction: builder.mutation<any, any>({
      query: (transaction) => ({
        url: "budget/transaction",
        method: "DELETE",
        body: transaction,
      }),
      invalidatesTags: ["Accounts", "Categories"],
    }),
    editTransaction: builder.mutation<any, any>({
      query: (transaction) => ({
        url: "budget/transaction",
        method: "PATCH",
        body: transaction,
      }),
      invalidatesTags: ["Accounts", "Categories"],
    }),
    getCategories: builder.query<AllocationData, void>({
      query: () => ({
        url: "budget/category",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),
    addCategory: builder.mutation<void, any>({
      query: (category) => {
        return {
          url: "budget/category",
          method: "POST",
          body: category,
        };
      },
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<void, { categoryId: string }>({
      query: (categoryId) => {
        return {
          url: "budget/category",
          method: "DELETE",
          body: categoryId,
        };
      },
      invalidatesTags: ["Categories", "Accounts"],
    }),
    addCategoryGroup: builder.mutation<void, { name: string }>({
      query: (categoryGroup) => {
        return {
          url: "budget/categorygroups",
          method: "POST",
          body: categoryGroup,
        };
      },
      invalidatesTags: ["Categories"],
    }),
    deleteCategoryGroup: builder.mutation<void, { categoryGroupId: string }>({
      query: (categoryGroup) => {
        return {
          url: "budget/categorygroups",
          method: "DELETE",
          body: categoryGroup,
        };
      },
      invalidatesTags: ["Categories"],
    }),
    editCategoryGroup: builder.mutation<
      void,
      { categoryGroupId: string; name: string }
    >({
      query: (updatedCategoryGroup) => {
        return {
          url: "budget/categorygroups",
          method: "PATCH",
          body: updatedCategoryGroup,
        };
      },
      invalidatesTags: ["Categories"],
    }),
    editMonth: builder.mutation<UpdatedMonthsById, UpdateMonthsPayload>({
      query: (assigned) => ({
        url: "budget/category/months",
        method: "PATCH",
        body: assigned,
      }),

      transformResponse: (response: unknown) => {
        return updatedMonthsByIdSchema.parse(response);
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        console.log("data:", data);

        dispatch(
          budgetSnapshotSlice.util.updateQueryData(
            "getBudgetSnapshot",
            undefined,
            (draft) => {
              for (const [id, month] of Object.entries(data)) {
                if (!month) continue;
                draft.months[id as MonthId] = month;
              }
            }
          )
        );
      },
    }),
  }),
});

export const {
  useGetDataQuery,
  useGetAccountsQuery,
  useAddAccountMutation,
  useDeleteAccountMutation,
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useEditTransactionMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useAddCategoryGroupMutation,
  useDeleteCategoryGroupMutation,
  useEditCategoryGroupMutation,
  useEditMonthMutation,
  useDuplicateTransactionsMutation,
} = budgetApiSlice;
