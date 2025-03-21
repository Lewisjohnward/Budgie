import { AddAccountPayload } from "../types/AccountSchema";
import {
  CategoriesNormalizedData,
  NormalizedData,
} from "../types/NormalizedData";
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
      invalidatesTags: ["Accounts"],
    }),
    // TODO: TYPING
    addTransaction: builder.mutation<any, any>({
      query: (transaction) => ({
        url: "budget/transaction",
        method: "POST",
        body: transaction,
      }),
      invalidatesTags: ["Accounts"],
    }),
    deleteTransaction: builder.mutation<any, any>({
      query: (transaction) => ({
        url: "budget/transaction",
        method: "DELETE",
        body: transaction,
      }),
      invalidatesTags: ["Accounts"],
    }),
    editTransaction: builder.mutation<any, any>({
      query: (transaction) => ({
        url: "budget/transaction",
        method: "PATCH",
        body: transaction,
      }),
      invalidatesTags: ["Accounts"],
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
} = budgetApiSlice;
