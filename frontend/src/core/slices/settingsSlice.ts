// used for selecting currenc

import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";
import { RootState } from "../store/store";

export type SettingsSlice = {
  currency: string;
};

const initialState: SettingsSlice = {
  currency: "$",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
  },
});

export const { setCurrency } = settingsSlice.actions;
export default settingsSlice.reducer;

export const selectCurrency = (state: RootState) => state.settings.currency;
