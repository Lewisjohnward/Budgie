import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";
import { RootState } from "@/core/store/store";

export type MonthState = {
  month: number;
};

const initialState: MonthState = {
  month: 0,
};

const monthSlice = createSlice({
  name: "month",
  initialState,
  reducers: {
    selectMonthIndex: (state, action: PayloadAction<number>) => {
      state.month = action.payload;
    },
  },
});

export const { selectMonthIndex } = monthSlice.actions;
export default monthSlice.reducer;

export const month = (state: RootState) => state.month;
