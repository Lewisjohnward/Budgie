// THIS IS USED TO PERSIST THE SELECTED MONTH INDEX WHEN USER NAVIGATES FROM BUDGET

import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";
import { RootState } from "@/core/store/store";
import { useAppSelector } from "@/core/hooks/reduxHooks";

export type MonthState = {
  monthIndex: number;
  hasInitialisedMonth: boolean;
};

const initialState: MonthState = {
  monthIndex: 0,
  hasInitialisedMonth: false,
};

const monthSlice = createSlice({
  name: "month",
  initialState,
  reducers: {
    selectMonthIndex: (state, action: PayloadAction<number>) => {
      state.monthIndex = action.payload;
    },
    setHasInitialisedMonth: (state, action: PayloadAction<boolean>) => {
      state.hasInitialisedMonth = action.payload;
    },
  },
});

export const { selectMonthIndex } = monthSlice.actions;
export const { setHasInitialisedMonth } = monthSlice.actions;
export default monthSlice.reducer;

export const month = (state: RootState) => state.month;

export const useMonthIndex = () => {
  return useAppSelector((state) => state.month.monthIndex);
};
export const useHasInitialisedMonth = () => {
  return useAppSelector((state) => state.month.hasInitialisedMonth);
};
