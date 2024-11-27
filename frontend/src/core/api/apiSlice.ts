import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { RootState } from "../store/store";
import { createApi } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "../auth/authSlice";

const baseQuery = fetchBaseQuery({
  // TODO: get url from env variable
  baseUrl: "http://localhost:8000",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If server returns a 403 when sending a request refresh token
  if (result.error && result.error.status === 403) {
    const refreshResult = await baseQuery("/refresh", api, extraOptions);
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
  endpoints: () => ({}),
});
