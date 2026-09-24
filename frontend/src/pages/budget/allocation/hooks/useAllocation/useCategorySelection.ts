import { useAppDispatch } from "@/core/hooks/reduxHooks";
import {
  addCategories,
  addCategoryGroup,
  clearSelection,
  removeCategories,
  removeCategoryGroup,
  SelectableCategory,
  usePreviousSelectedCategory,
  useSelectedCategories,
  useSelectedCategoryGroupIds,
} from "../../slices/categorySelectionSlice";
import { CategoryGroupId, CategoryId } from "../../types/types";
import {
  CategorySystemBranded,
  CategoryUserBranded,
} from "@/core/types/NormalizedData";
import { useMemo } from "react";

type Category = CategoryUserBranded | CategorySystemBranded;

// Input
export type UseCategorySelectionParams = {
  orderedCategories: Category[];
  categoryGroupIds: CategoryGroupId[];
};

// Output
export type CategorySelectionState = {
  selectAll: () => void;
  selected: SelectableCategory[];
  getAllSelectionState: () => SelectionState;
  isSelected: (id: CategoryId) => boolean;
  onRowClick: (
    e: React.MouseEvent,
    category: CategoryUserBranded | CategorySystemBranded
  ) => void;
  getCategoryGroupSelectionState: (id: CategoryGroupId) => SelectionState;
  onCategoryGroupClick: (id: CategoryGroupId) => void;
  toggle: (category: SelectableCategory) => void;
  clear: () => void;
};

const SELECTION_STATE = ["NONE", "PARTIAL", "COMPLETE"] as const;

export type SelectionState = (typeof SELECTION_STATE)[number];

export const useCategorySelection = ({
  orderedCategories,
  categoryGroupIds,
}: UseCategorySelectionParams): CategorySelectionState => {
  const dispatch = useAppDispatch();

  const selected = useSelectedCategories();
  const selectedCategoryGroupIds = useSelectedCategoryGroupIds();
  const previous = usePreviousSelectedCategory();

  const selectedSet = useMemo(
    () => new Set(selected.map((c) => c.id)),
    [selected]
  );

  const selectedCategoryGroupSet = useMemo(
    () => new Set(selectedCategoryGroupIds),
    [selectedCategoryGroupIds]
  );

  const emptyCategoryGroupIds = useMemo(() => {
    const groupsWithCategories = new Set(
      orderedCategories.map((category) => category.categoryGroupId)
    );

    return categoryGroupIds.filter((id) => !groupsWithCategories.has(id));
  }, [orderedCategories, categoryGroupIds]);

  const isSelected = (id: CategoryId) => selectedSet.has(id);

  const clear = () => dispatch(clearSelection());

  const toggle = (category: SelectableCategory): void => {
    if (isSelected(category.id)) {
      dispatch(removeCategories([category]));
    } else {
      dispatch(addCategories([category]));
    }
  };

  const onRowClick = (
    e: React.MouseEvent,
    category: CategoryUserBranded | CategorySystemBranded
  ): void => {
    // CTRL = toggle
    if (e.ctrlKey) {
      toggle(category);
      return;
    }

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

      return;
    }

    // Normal click
    dispatch(clearSelection());
    dispatch(addCategories([category]));
  };

  const getCategoryGroupSelectionState = (
    id: CategoryGroupId
  ): SelectionState => {
    const groupCategories = orderedCategories.filter(
      (c) => c.categoryGroupId === id
    );

    // Empty groups are selected independently from categories.
    if (groupCategories.length === 0) {
      return selectedCategoryGroupSet.has(id) ? "COMPLETE" : "NONE";
    }

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

    // Empty category groups have no categories to select, so track
    // the group itself instead.
    if (categoriesToSelect.length === 0) {
      if (selectedCategoryGroupSet.has(id)) {
        dispatch(removeCategoryGroup(id));
      } else {
        dispatch(addCategoryGroup(id));
      }

      return;
    }

    const isAtLeastOneSelected = categoriesToSelect.some((c) =>
      isSelected(c.id)
    );

    if (isAtLeastOneSelected) {
      dispatch(removeCategories(categoriesToSelect));
    } else {
      dispatch(addCategories(categoriesToSelect));
    }
  };

  const selectAll = (): void => {
    const selectedCategoryCount = orderedCategories.filter((c) =>
      selectedSet.has(c.id)
    ).length;

    const selectedEmptyGroupCount = emptyCategoryGroupIds.filter((id) =>
      selectedCategoryGroupSet.has(id)
    ).length;

    const selectedCount = selectedCategoryCount + selectedEmptyGroupCount;

    if (selectedCount > 0) {
      dispatch(clearSelection());
      return;
    }

    dispatch(addCategories(orderedCategories));

    for (const id of emptyCategoryGroupIds) {
      dispatch(addCategoryGroup(id));
    }
  };

  const getAllSelectionState = (): SelectionState => {
    const totalSelectableCount =
      orderedCategories.length + emptyCategoryGroupIds.length;

    if (totalSelectableCount === 0) return "NONE";

    const selectedCategoryCount = orderedCategories.filter((c) =>
      selectedSet.has(c.id)
    ).length;

    const selectedEmptyGroupCount = emptyCategoryGroupIds.filter((id) =>
      selectedCategoryGroupSet.has(id)
    ).length;

    const selectedCount = selectedCategoryCount + selectedEmptyGroupCount;

    if (selectedCount === 0) return "NONE";
    if (selectedCount === totalSelectableCount) return "COMPLETE";

    return "PARTIAL";
  };

  return {
    selectAll,
    selected,
    getAllSelectionState,
    isSelected,
    onRowClick,
    getCategoryGroupSelectionState,
    onCategoryGroupClick,
    toggle,
    clear,
  };
};

function getRangeSelection(
  ordered: Category[],
  startId: CategoryId,
  endId: CategoryId
): Category[] {
  const start = ordered.findIndex((c) => c.id === startId);
  const end = ordered.findIndex((c) => c.id === endId);

  if (start === -1 || end === -1) return [];

  const [from, to] = start < end ? [start, end] : [end, start];

  return ordered.slice(from, to + 1);
}
