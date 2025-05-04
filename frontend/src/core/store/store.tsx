import { configureStore } from "@reduxjs/toolkit/react";
import authReducer from "@/core/slices/authSlice";
import dialogReducer from "../slices/dialogSlice";
import transactionFormRow from "@/pages/budget/account/slices/transactionFormRowSlice";
import { apiSlice } from "../api/apiSlice";

export const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      dialogs: dialogReducer,
      transactionFormRow: transactionFormRow,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleWare) =>
      getDefaultMiddleWare().concat(apiSlice.middleware),
    // TODO: make env variable
    devTools: true,
  });

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
