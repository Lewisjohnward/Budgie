import { configureStore } from "@reduxjs/toolkit/react";
import authReducer from "@/core/slices/authSlice";
import dialogReducer from "../slices/dialogSlice";
import transactionFormRowReducer from "@/pages/budget/account/slices/transactionFormRowSlice";
import monthReducer from "@/pages/budget/allocation/slices/monthSlice";
import { apiSlice } from "../api/apiSlice";

export const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      dialogs: dialogReducer,
      transactionFormRow: transactionFormRowReducer,
      month: monthReducer,

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
