import { apiSlice } from "./apiSlice";

export const budgetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // TODO: this needs typing correctly
    getData: builder.query<any, void>({
      query: () => ({
        url: "budget/data",
        method: "GET",
      }),
    }),
    // TODO: this needs typing
    getAccounts: builder.query<any, void>({
      query: () => ({
        url: "budget/account",
        method: "GET",
      }),
      providesTags: ["Accounts"],
    }),
    // TODO: TYPING
    addAccount: builder.mutation<any, any>({
      query: (newAccount) => ({
        url: "budget/account",
        method: "POST",
        body: newAccount,
      }),
      invalidatesTags: ["Accounts"],
    }),
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
  }),
});

export const {
  useGetDataQuery,
  useGetAccountsQuery,
  useAddAccountMutation,
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useEditTransactionMutation,
} = budgetApiSlice;
