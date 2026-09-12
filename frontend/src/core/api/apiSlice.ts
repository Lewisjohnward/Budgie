import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "../slices/authSlice";
import { RootState } from "../store/store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
  responseHandler: async (response) => {
    const contentType = response.headers.get("content-type");

    if (response.status === 401) {
      return "No refresh token";
    }

    if (contentType?.includes("application/json")) {
      return response.json();
    } else if (contentType?.includes("text/plain")) {
      return response.text();
    } else if (response.status === 204) {
      return null;
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If server returns a 401 when sending a request refresh token
  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery(
      "user/auth/refresh",
      api,
      extraOptions
    );
    if (refreshResult.data) {
      const email = (api.getState() as RootState).auth.email;
      api.dispatch(setCredentials({ ...refreshResult.data, email }));
      // Retry original query
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }

  return result;
};

export const apiSlice = createApi({
  // baseQuery: baseQuery /* baseQueryWithReauth */,
  baseQuery: baseQueryWithReauth,
  // TODO:(lewis 2026-09-09 13:19) bootstrap will need removing when finishing accounts
  tagTypes: ["Accounts", "Categories", "Bootstrap"],
  endpoints: () => ({}),
});
