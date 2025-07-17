import { CategoryContextType } from "@/pages/budget/allocation/Allocation";
import { AddAccountPayload } from "../types/AccountSchema";
import { Month } from "../types/MonthSchema";
import { NormalizedData } from "../types/NormalizedData";
import { DuplicateTransactions } from "../types/TransactionSchema";
import { apiSlice } from "./apiSlice";
import { AllocationData } from "../types/Allocation";

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
    editCategory: builder.mutation<void, CategoryContextType>({
      query: (category) => {
        return {
          url: "budget/category",
          method: "PATCH",
          body: category,
        };
      },
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<void, string>({
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
          url: "budget/categorygroup",
          method: "POST",
          body: categoryGroup,
        };
      },
      invalidatesTags: ["Categories"],
    }),
    editMonth: builder.mutation<void, Month>({
      query: (assigned) => {
        return {
          url: "budget/assign",
          method: "PATCH",
          body: assigned,
        };
      },
      invalidatesTags: ["Categories"],
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
  useEditCategoryMutation,
  useDeleteCategoryMutation,
  useAddCategoryGroupMutation,
  useEditMonthMutation,
  useDuplicateTransactionsMutation,
} = budgetApiSlice;
