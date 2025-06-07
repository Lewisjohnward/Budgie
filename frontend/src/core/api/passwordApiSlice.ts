import { apiSlice } from "./apiSlice";

export const passwordApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    changePassword: builder.mutation<void, {oldPassword: string, newPassword: string}>({
      query: () => ({
        url: "password",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useChangePasswordMutation,
} = passwordApiSlice;
