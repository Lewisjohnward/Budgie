import { AddAccountPayload } from "../types/AccountSchema";
import { NormalizedData } from "../types/NormalizedData";
import { apiSlice } from "./apiSlice";
import { AllocationData } from "../types/Allocation";

export const budgetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<NormalizedData, void>({
      query: () => ({
        url: "/budget/account",
        method: "GET",
      }),
      providesTags: ["Accounts"],
    }),
    addAccount: builder.mutation<void, AddAccountPayload>({
      query: (newAccount) => ({
        url: "/budget/account",
        method: "POST",
        body: newAccount,
      }),
      invalidatesTags: ["Accounts", "Categories"],
    }),
    deleteAccount: builder.mutation<void, { accountId: string }>({
      query: (accountId) => ({
        url: `/budget/account`,
        method: "DELETE",
        body: accountId,
      }),
      invalidatesTags: ["Accounts", "Categories"],
    }),
    getCategories: builder.query<AllocationData, void>({
      query: () => ({
        url: "/budget/categories",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useAddAccountMutation,
  useDeleteAccountMutation,
  useGetCategoriesQuery,
} = budgetApiSlice;
