import { AddAccountPayload } from "../types/AccountSchema";
import { Month } from "../types/MonthSchema";
import {
  CategoriesNormalizedData,
  NormalizedData,
} from "../types/NormalizedData";
import { DuplicateTransactions } from "../types/TransactionSchema";
import { apiSlice } from "./apiSlice";

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
      invalidatesTags: ["Accounts"],
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
    getCategories: builder.query<CategoriesNormalizedData, void>({
      query: () => ({
        url: "budget/categories",
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
    addCategoryGroup: builder.mutation<void, any>({
      query: (categoryGroup) => {
        return {
          url: "budget/categoryGroup",
          method: "POST",
          body: categoryGroup,
        };
      },
      invalidatesTags: ["Categories"],
    }),
    editMonth: builder.mutation<void, Month>({
      query: (assigned) => {
        return {
          url: "budget/month",
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
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useEditTransactionMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useAddCategoryGroupMutation,
  useEditMonthMutation,
  useDuplicateTransactionsMutation,
} = budgetApiSlice;
