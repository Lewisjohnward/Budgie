import { createSlice } from "@reduxjs/toolkit/react";
import { RootState } from "../store/store";

export type ManagePayeesState = {
  dialogOpen: boolean;
};

const initialState: ManagePayeesState = {
  dialogOpen: false,
};

const managePayeesSlice = createSlice({
  name: "managePayees",
  initialState,
  reducers: {
    toggleDialog: (state) => {
      state.dialogOpen = !state.dialogOpen;
    },
  },
});

export const { toggleDialog } = managePayeesSlice.actions;
export default managePayeesSlice.reducer;

export const selectDialogOpen = (state: RootState) =>
  state.managePayees.dialogOpen;
