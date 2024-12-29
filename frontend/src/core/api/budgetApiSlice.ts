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
    }),
  }),
});

export const { useGetDataQuery, useGetAccountsQuery } = budgetApiSlice;
