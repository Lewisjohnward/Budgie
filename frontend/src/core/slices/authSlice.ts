import { createSlice } from "@reduxjs/toolkit/react";
import { RootState } from "../store/store";

export type AuthState = {
  email: string | null;
  accessToken: string | null;
};

const initialState: AuthState = {
  email: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { email, token } = action.payload;
      state.email = email;
      state.accessToken = token;
    },
    logOut: (state) => {
      state.email = null;
      state.accessToken = null;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.email;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
