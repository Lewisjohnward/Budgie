// Endpoints to include:
//     Fetch user profile
//     Update user profile
//     Fetch user settings or preferences
//     Update user settings or preferences

import { apiSlice } from "./apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      // query: () => "user/profile",
      query: () => "user",
      keepUnusedDataFor: 0,
    }),
    updateUserProfile: builder.mutation({
      query: (updatedData) => ({
        url: "user/profile",
        method: "PUT",
        body: { ...updatedData },
      }),
    }),
    getUserSettings: builder.query({
      query: () => "user/settings",
    }),
    updateUserSettings: builder.mutation({
      query: (updatedSettings) => ({
        url: "user/settings",
        method: "PUT",
        body: { ...updatedSettings },
      }),
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
} = userApiSlice;
