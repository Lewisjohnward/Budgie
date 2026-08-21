import { useAppDispatch } from "@/core/hooks/reduxHooks";
import {
  addCategories,
  clearCategories,
  removeCategories,
  SelectableCategory,
  usePreviousSelectedCategory,
  useSelectedCategories,
} from "../../slices/selectedCategorySlice";
import { CategoryGroupId, CategoryId } from "../../types/types";
import { CategoryUserBranded } from "@/core/types/NormalizedData";
import { useMemo } from "react";

// Input
export type UseCategorySelectionParams = {
  orderedCategories: CategoryUserBranded[];
};

// Output
export type CategorySelectionState = {
  selectAll: () => void;
  getAllSelectionState: () => SelectionState;
  isSelected: (id: CategoryId) => boolean;
  onRowClick: (e: React.MouseEvent, category: CategoryUserBranded) => void;
  getCategoryGroupSelectionState: (id: CategoryGroupId) => SelectionState;
  onCategoryGroupClick: (id: CategoryGroupId) => void;
  toggle: (category: SelectableCategory) => void;
  clear: () => void;
};

const SELECTION_STATE = ["NONE", "PARTIAL", "COMPLETE"] as const;

export type SelectionState = (typeof SELECTION_STATE)[number];

export const useCategorySelection = ({
  orderedCategories,
}: UseCategorySelectionParams): CategorySelectionState => {
  const dispatch = useAppDispatch();

  const selected = useSelectedCategories();
  const previous = usePreviousSelectedCategory();

  const selectedSet = useMemo(
    () => new Set(selected.map((c) => c.id)),
    [selected]
  );

  const isSelected = (id: CategoryId) => selectedSet.has(id);

  const clear = () => dispatch(clearCategories());

  const toggle = (category: SelectableCategory): void => {
    if (isSelected(category.id)) {
      dispatch(removeCategories([category]));
    } else {
      dispatch(addCategories([category]));
    }
  };

  const onRowClick = (
    e: React.MouseEvent,
    category: CategoryUserBranded
  ): void => {
    // CTRL = toggle
    if (e.ctrlKey) return toggle(category);

    // SHIFT = range select
    if (e.shiftKey && previous) {
      const range = getRangeSelection(
        orderedCategories,
        previous.id,
        category.id
      );

      const alreadySelected = range.every((c) => selectedSet.has(c.id));

      if (alreadySelected) {
        dispatch(removeCategories(range));
      } else {
        dispatch(addCategories(range));
      }
    }

    // normal click
    dispatch(clearCategories());
    dispatch(addCategories([category]));
  };

  const getCategoryGroupSelectionState = (
    id: CategoryGroupId
  ): SelectionState => {
    const groupCategories = orderedCategories.filter(
      (c) => c.categoryGroupId === id
    );

    if (groupCategories.length === 0) return "NONE";

    const selectedCount = groupCategories.reduce((count, c) => {
      return count + (selectedSet.has(c.id) ? 1 : 0);
    }, 0);

    if (selectedCount === 0) return "NONE";
    if (selectedCount === groupCategories.length) return "COMPLETE";

    return "PARTIAL";
  };

  const onCategoryGroupClick = (id: CategoryGroupId): void => {
    const categoriesToSelect = orderedCategories.filter(
      (c) => c.categoryGroupId === id
    );
    const isAtleastOneSelected = categoriesToSelect.some((c) =>
      isSelected(c.id)
    );
    if (isAtleastOneSelected) {
      dispatch(removeCategories(categoriesToSelect));
    } else {
      dispatch(addCategories(categoriesToSelect));
    }
  };

  const selectAll = (): void => {
    const isAtleastOneSelected = orderedCategories.some((c) =>
      isSelected(c.id)
    );

    if (isAtleastOneSelected) {
      dispatch(clearCategories());
    } else {
      dispatch(addCategories(orderedCategories));
    }
  };

  const getAllSelectionState = (): SelectionState => {
    if (orderedCategories.length === 0) return "NONE";

    const selectedCount = orderedCategories.reduce((count, c) => {
      return count + (selectedSet.has(c.id) ? 1 : 0);
    }, 0);

    if (selectedCount === 0) return "NONE";
    if (selectedCount === orderedCategories.length) return "COMPLETE";
    if (selectedCount > 0) return "PARTIAL";

    return "PARTIAL";
  };

  return {
    selectAll,
    getAllSelectionState,

    // isRowSelected
    isSelected,
    onRowClick,

    getCategoryGroupSelectionState,
    onCategoryGroupClick,
    toggle,
    clear,
    // TODO:(lewis 2026-05-10 15:30) maybe separate this into category and categoryGroup?
  };
};

function getRangeSelection(
  ordered: CategoryUserBranded[],
  startId: CategoryId,
  endId: CategoryId
): CategoryUserBranded[] {
  const start = ordered.findIndex((c) => c.id === startId);
  const end = ordered.findIndex((c) => c.id === endId);

  if (start === -1 || end === -1) return [];

  const [from, to] = start < end ? [start, end] : [end, start];

  return ordered.slice(from, to + 1);
}
