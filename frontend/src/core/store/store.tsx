import { configureStore } from "@reduxjs/toolkit/react";
import authReducer from "../auth/authSlice";
import { apiSlice } from "../api/apiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleWare) => 
    getDefaultMiddleWare().concat(apiSlice.middleware),
  // TODO: make env variable
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
