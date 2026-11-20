import { AddAccountPayload } from "@/core/types/AccountSchema";
import { apiSlice } from "../../apiSlice";

export const accountApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addAccount: builder.mutation<void, AddAccountPayload>({
      query: (newAccount) => ({
        url: "/budget/account",
        method: "POST",
        body: newAccount,
      }),
      invalidatesTags: ["Bootstrap"],
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
