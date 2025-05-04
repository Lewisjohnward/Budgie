import { createSlice } from "@reduxjs/toolkit/react";
import { RootState } from "../store/store";
import { Account } from "../types/NormalizedData";

export type dialogState = {
  managePayees: boolean;
  editAccount: boolean;
  editingAccount: Account | null;
};

const initialState: dialogState = {
  managePayees: false,
  editAccount: false,
  editingAccount: null,
};

const dialogSlice = createSlice({
  name: "dialogs",
  initialState,
  reducers: {
    toggleManagePayees: (state) => {
      state.managePayees = !state.managePayees;
    },
    toggleEditAccount: (state, action) => {
      state.editAccount = !state.editAccount;
      state.editingAccount = action.payload;
    },
  },
});

export const { toggleManagePayees, toggleEditAccount } = dialogSlice.actions;
export default dialogSlice.reducer;

export const selectManagePayees = (state: RootState) =>
  state.dialogs.managePayees;
export const selectEditAccount = (state: RootState) =>
  state.dialogs.editAccount;
export const selectEditingAccount = (state: RootState) =>
  state.dialogs.editingAccount;
