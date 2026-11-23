import { apiSlice } from "../../apiSlice";
import { CreateAccountInput, CreateAccountResult } from "./types";
import { toCreateAccountRequest } from "./mappers/toRequest";
import { toCreateAccountResult } from "./mappers/toResponse";

export const accountApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addAccount: builder.mutation<CreateAccountResult, CreateAccountInput>({
      query: (input) => ({
        url: "/budget/account",
        method: "POST",
        body: toCreateAccountRequest(input),
      }),
      transformResponse: toCreateAccountResult,
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
