import { apiSlice } from "./apiSlice";
import { SignupPayload } from "../schemas/signupSchema";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<void, SignupPayload>({
      query: (credentials) => ({
        url: "user/register",
        method: "POST",
        body: { ...credentials },
      }),
    }),

    // TODO: this needs typing <res, req>
    login: builder.mutation({
      query: (credentials) => ({
        url: "user/login",
        method: "POST",
        body: { ...credentials },
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "user/logout",
        method: "POST",
      }),
    }),
    refreshToken: builder.mutation<void, void>({
      query: () => ({
        url: "user/refresh",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApiSlice;
