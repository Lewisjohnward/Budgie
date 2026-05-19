import { useMemo } from "react";
import { useToggle } from "../../components/assign/hooks";
import { CategoryId, CategoryMonthMap } from "../../types/types";

// Input
type UseCategoryBreakdownParams = {
  currentMonthMap: CategoryMonthMap;
  previousMonthMap: CategoryMonthMap | null;

  selectedCategoryIds: CategoryId[];

  isUncategorisedSelected: boolean;

  currentMonthName: string;
  hasSelectedCategories: boolean;
};

// Output
export type CategoryBreakdownViewModel = {
  hasSelectedCategories: boolean;
  currentMonthName: string;

  view: CategoryBreakdownView;

  totals: {
    available: number;
    assigned: number;
    spending: number;
    leftover: number;
  };

  open: boolean;
  toggleOpen: () => void;
};

export type CategoryBreakdownView =
  | {
      kind: "multiple";
    }
  | {
      kind: "single";
      isUncategorisedSelected: boolean;
    };

export type ViewMode = CategoryBreakdownView["kind"];

export function useCategoryBreakdownViewModel({
  currentMonthMap,
  previousMonthMap,
  selectedCategoryIds,
  isUncategorisedSelected,
  currentMonthName,
  hasSelectedCategories,
}: UseCategoryBreakdownParams): CategoryBreakdownViewModel {
  const ui = useToggle(true);

  const totals = useMemo(() => {
    let available = 0;
    let assigned = 0;
    let spending = 0;
    let leftover = 0;

    for (const id of selectedCategoryIds) {
      const currentMonth = currentMonthMap[id];
      const previousMonth = previousMonthMap?.[id];

      if (!currentMonth) continue;

      available += currentMonth.available;
      assigned += currentMonth.assigned;
      spending += currentMonth.activity;

      if (previousMonth) {
        leftover += Math.max(0, previousMonth.available);
      }
    }

    return { available, assigned, spending, leftover };
  }, [currentMonthMap, previousMonthMap, selectedCategoryIds]);

  const view: CategoryBreakdownView =
    selectedCategoryIds.length === 1
      ? {
          kind: "single",
          isUncategorisedSelected,
        }
      : {
          kind: "multiple",
        };

  return {
    // I don't think this is used
    hasSelectedCategories,
    currentMonthName,
    totals,
    view,

    open: ui.value,
    toggleOpen: ui.toggle,
  };
}
