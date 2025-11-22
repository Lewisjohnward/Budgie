// THIS IS USED TO PERSIST THE SELECTED MONTH INDEX WHEN USER NAVIGATES FROM REFLECT AND INITIALISE THE INDEX TO CURRENT MONTH

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/core/store/store";
import type { ReflectPageKey } from "../constants/pages";
import {
  DEFAULT_DATE_RANGE,
  type DateRangeOption,
} from "../constants/dateRanges";

export interface PageFilters {
  monthIndex: number;
  startMonthIndex: number;
  endMonthIndex: number;
  startMonthDate?: string; // Calculated date, may not exist in data
  endMonthDate?: string; // Calculated date, may not exist in data
  categories: string[];
  accounts: string[];
  selectedDateRange: DateRangeOption | null;
}

type ReflectMonthState = {
  initialized: boolean;
  pages: Record<ReflectPageKey, PageFilters>;
};

const initialState: ReflectMonthState = {
  initialized: false,
  pages: {
    "spending-breakdown": {
      monthIndex: 0,
      startMonthIndex: 0,
      endMonthIndex: 0,
      categories: [],
      accounts: [],
      selectedDateRange: DEFAULT_DATE_RANGE,
    },
    "spending-trends": {
      monthIndex: 0,
      startMonthIndex: 0,
      endMonthIndex: 0,
      categories: [],
      accounts: [],
      selectedDateRange: DEFAULT_DATE_RANGE,
    },
    "budget-vs-actual": {
      monthIndex: 0,
      startMonthIndex: 0,
      endMonthIndex: 0,
      categories: [],
      accounts: [],
      selectedDateRange: DEFAULT_DATE_RANGE,
    },
    "category-deep-dive": {
      monthIndex: 0,
      startMonthIndex: 0,
      endMonthIndex: 0,
      categories: [],
      accounts: [],
      selectedDateRange: DEFAULT_DATE_RANGE,
    },
  },
};

export const reflectMonthSlice = createSlice({
  name: "reflectMonth",
  initialState,
  reducers: {
    initializeAllPages: (
      state,
      action: PayloadAction<{ monthIndex: number }>
    ) => {
      const { monthIndex } = action.payload;
      Object.keys(state.pages).forEach((page) => {
        state.pages[page as ReflectPageKey].monthIndex = monthIndex;
        state.pages[page as ReflectPageKey].startMonthIndex = monthIndex;
        state.pages[page as ReflectPageKey].endMonthIndex = monthIndex;
      });
      state.initialized = true;
    },
    setPageFilters: (
      state,
      action: PayloadAction<{
        page: ReflectPageKey;
        filters: Partial<PageFilters>;
      }>
    ) => {
      const { page, filters } = action.payload;
      state.pages[page] = { ...state.pages[page], ...filters };
    },
    incrementPageMonth: (
      state,
      action: PayloadAction<{ page: ReflectPageKey }>
    ) => {
      const { page } = action.payload;
      state.pages[page].monthIndex += 1;
      state.pages[page].startMonthIndex += 1;
      state.pages[page].endMonthIndex += 1;
    },
    decrementPageMonth: (
      state,
      action: PayloadAction<{ page: ReflectPageKey }>
    ) => {
      const { page } = action.payload;
      state.pages[page].monthIndex -= 1;
      state.pages[page].startMonthIndex -= 1;
      state.pages[page].endMonthIndex -= 1;
    },
    setPageDateRange: (
      state,
      action: PayloadAction<{
        page: ReflectPageKey;
        dateRange: DateRangeOption | null;
      }>
    ) => {
      const { page, dateRange } = action.payload;
      state.pages[page].selectedDateRange = dateRange;
    },
  },
});

export const {
  initializeAllPages,
  setPageFilters,
  incrementPageMonth,
  decrementPageMonth,
  setPageDateRange,
} = reflectMonthSlice.actions;

export const reflectMonth = (state: RootState) => state.reflectMonth;

export default reflectMonthSlice.reducer;
