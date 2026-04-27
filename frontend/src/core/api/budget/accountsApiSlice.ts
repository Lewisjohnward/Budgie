import { apiSlice } from "../apiSlice";

export const accountsApiSlice = apiSlice.injectEndpoints({
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
      invalidatesTags: ["Accounts", "Categories", "Bootstrap"],
    }),
    deleteAccount: builder.mutation<void, { accountId: string }>({
      query: (accountId) => ({
        url: `budget/account`,
        method: "DELETE",
        body: accountId,
      }),
      invalidatesTags: ["Accounts", "Categories", "Bootstrap"],
    }),
    editAccount: builder.mutation<void, any>({
      query: (accountId) => ({
        url: `budget/account`,
        method: "DELETE",
        body: accountId,
      }),
      invalidatesTags: ["Accounts", "Categories", "Bootstrap"],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useAddAccountMutation,
  useDeleteAccountMutation,
  useEditAccountMutation,
} = accountsApiSlice;
