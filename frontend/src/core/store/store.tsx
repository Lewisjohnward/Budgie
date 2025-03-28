import { configureStore } from "@reduxjs/toolkit/react";
import authReducer from "../slices/authSlice";
import managePayeesReducer from "../slices/managePayeesSlice";
import { apiSlice } from "../api/apiSlice";

export const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      managePayees: managePayeesReducer,
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
