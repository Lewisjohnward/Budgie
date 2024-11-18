import { configureStore } from "@reduxjs/toolkit/react";
import authReducer from "../auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  // TODO: make env variable
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
