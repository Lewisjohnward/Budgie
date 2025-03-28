import { createSlice } from "@reduxjs/toolkit/react";
import { RootState } from "../store/store";

export type dialogState = {
  managePayees: boolean;
  editAccount: boolean;
};

const initialState: dialogState = {
  managePayees: false,
  editAccount: false,
};

const dialogSlice = createSlice({
  name: "dialogs",
  initialState,
  reducers: {
    toggleManagePayees: (state) => {
      state.managePayees = !state.managePayees;
    },
    toggleEditAccount: (state) => {
      state.editAccount = !state.editAccount;
    },
  },
});

export const { toggleManagePayees, toggleEditAccount } = dialogSlice.actions;
export default dialogSlice.reducer;

export const selectManagePayees = (state: RootState) =>
  state.dialogs.managePayees;
export const selectEditAccount = (state: RootState) =>
  state.dialogs.editAccount;
