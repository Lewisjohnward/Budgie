// Used when selecting categories on the allocation page to view
// left-over amounts from last month etc. for in-depth details.

import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";
import { RootState } from "@/core/store/store";
import { useAppSelector } from "@/core/hooks/reduxHooks";
import { CategoryId, CategoryGroupId } from "../types/types";

export type SelectableCategory = {
  id: CategoryId;
  name: string;
  categoryGroupId: CategoryGroupId;
};

export type CategorySelectionState = {
  shiftAnchor: SelectableCategory | null;
  selectedCategories: SelectableCategory[];
  selectedCategoryGroupIds: CategoryGroupId[];
};

const initialState: CategorySelectionState = {
  shiftAnchor: null,
  selectedCategories: [],
  selectedCategoryGroupIds: [],
};

const categorySelectionSlice = createSlice({
  name: "categorySelection",
  initialState,
  reducers: {
    addCategories: (state, action: PayloadAction<SelectableCategory[]>) => {
      state.selectedCategories.push(...action.payload);
    },

    removeCategories: (state, action: PayloadAction<SelectableCategory[]>) => {
      const idsToRemove = action.payload.map((category) => category.id);

      state.selectedCategories = state.selectedCategories.filter(
        (category) => !idsToRemove.includes(category.id)
      );
    },

    setShiftAnchor: (
      state,
      action: PayloadAction<SelectableCategory | null>
    ) => {
      state.shiftAnchor = action.payload;
    },

    addCategoryGroup: (state, action: PayloadAction<CategoryGroupId>) => {
      if (!state.selectedCategoryGroupIds.includes(action.payload)) {
        state.selectedCategoryGroupIds.push(action.payload);
      }
    },

    removeCategoryGroup: (state, action: PayloadAction<CategoryGroupId>) => {
      state.selectedCategoryGroupIds = state.selectedCategoryGroupIds.filter(
        (id) => id !== action.payload
      );
    },

    clearSelection: (state) => {
      state.selectedCategories = [];
      state.selectedCategoryGroupIds = [];
      state.shiftAnchor = null;
    },
  },
});

export const {
  addCategories,
  removeCategories,
  setShiftAnchor,
  addCategoryGroup,
  removeCategoryGroup,
  clearSelection,
} = categorySelectionSlice.actions;

export default categorySelectionSlice.reducer;

export const selectCategorySelection = (state: RootState) =>
  state.categorySelection;

export const useSelectedCategories = () => {
  return useAppSelector((state) => state.categorySelection.selectedCategories);
};

export const useShiftAnchor = () => {
  return useAppSelector((state) => state.categorySelection.shiftAnchor);
};

export const useSelectedCategoryGroupIds = () => {
  return useAppSelector(
    (state) => state.categorySelection.selectedCategoryGroupIds
  );
};
