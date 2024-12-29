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
  responseHandler: async (response) => {
    const contentType = response.headers.get("content-type");

    if (response.status === 401) {
      return "No refresh token";
    }

    if (contentType?.includes("application/json")) {
      console.log("json");
      return response.json(); // Parse as JSON if Content-Type is JSON
    } else if (contentType?.includes("text/plain")) {
      console.log("text");
      return response.text(); // Parse as plain text if Content-Type is text
    } else if (response.status === 204) {
      console.log("error 204");
      return null; // Handle 204 No Content (empty response body)
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
  console.log("base query with reauth");
  let result = await baseQuery(args, api, extraOptions);

  // If server returns a 401 when sending a request refresh token
  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery("user/refresh", api, extraOptions);
    if (refreshResult.data) {
      const email = (api.getState() as RootState).auth.email;
      api.dispatch(setCredentials({ ...refreshResult.data, email }));
      // Retry original query
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }

  console.log("base query, no error");

  return result;
};

export const apiSlice = createApi({
  // baseQuery: baseQuery /* baseQueryWithReauth */,
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Accounts"],
  endpoints: () => ({}),
});
