import { apiSlice } from "./apiSlice";
import { AllocationData } from "../types/Allocation";

export const budgetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<AllocationData, void>({
      query: () => ({
        url: "/budget/categories",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),
  }),
});

export const { useGetCategoriesQuery } = budgetApiSlice;
