import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";
import { RootState } from "@/core/store/store";

export type TransactionFormRowState = {
  open: boolean;
  displayAccount: boolean;
  accountId: string;
  transactionId?: string;
};

const initialState: TransactionFormRowState = {
  open: false,
  displayAccount: false,
  accountId: "",
};

const transactionFormRowSlice = createSlice({
  name: "transactionFormRow",
  initialState,
  reducers: {
    openTransactionFormRow: (
      state,
      action: PayloadAction<{
        displayAccount: boolean;
        accountId: string;
        transactionId?: string;
      }>,
    ) => {
      state.open = true;
      state.displayAccount = action.payload.displayAccount;
      state.accountId = action.payload.accountId;
      state.transactionId = action.payload.transactionId;
    },
    closeTransactionFormRow: (state) => {
      state.open = false;
      state.displayAccount = initialState.displayAccount;
      state.accountId = initialState.accountId;
      state.transactionId = initialState.transactionId;
    },
  },
});

export const { openTransactionFormRow, closeTransactionFormRow } =
  transactionFormRowSlice.actions;
export default transactionFormRowSlice.reducer;

export const transactionFormRow = (state: RootState) =>
  state.transactionFormRow;
