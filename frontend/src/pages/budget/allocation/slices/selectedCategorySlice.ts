// used when selecting a category on allocation page to view left over from last month etc for in depth details

import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";
import { RootState } from "@/core/store/store";
import { useAppSelector } from "@/core/hooks/reduxHooks";
import { CategoryId, CategoryGroupId } from "../types/types";

export type SelectableCategory = {
  id: CategoryId;
  name: string;
  categoryGroupId: CategoryGroupId;
};

export type SelectedCategoryState = {
  previousSelected: SelectableCategory | null;
  selected: SelectableCategory[];
};

const initialState: SelectedCategoryState = {
  previousSelected: null,
  selected: [],
};

const categorySlice = createSlice({
  name: "selectedCategories",
  initialState,
  reducers: {
    addCategories: (state, action: PayloadAction<SelectableCategory[]>) => {
      state.selected.push(...action.payload);
      state.previousSelected = state.selected[state.selected.length - 1];
    },
    removeCategories: (state, action: PayloadAction<SelectableCategory[]>) => {
      const idsToRemove = action.payload.map((cat) => cat.id);
      state.selected = state.selected.filter(
        (cat) => !idsToRemove.includes(cat.id)
      );
      if (action.payload.length > 1) {
        state.previousSelected = state.selected[state.selected.length - 1];
      } else {
        state.previousSelected = action.payload[0];
      }
    },
    clearCategories: (state) => {
      state.selected = [];
      state.previousSelected = null;
    },
  },
});

export const { addCategories, removeCategories, clearCategories } =
  categorySlice.actions;
export default categorySlice.reducer;

export const selectSelectedCategories = (state: RootState) =>
  state.selectedCategories;

export const useSelectedCategories = () => {
  return useAppSelector((state) => state.selectedCategories.selected);
};

export const usePreviousSelectedCategory = () => {
  return useAppSelector((state) => state.selectedCategories.previousSelected);
};
