import { useMemo } from "react";
import { useToggle } from "../../components/assign/hooks";
import { CategoryId, CategoryMonthMap } from "../../types/types";

// Input
type UseCategoryBreakdownParams = {
  currentMonthMap: CategoryMonthMap;
  previousMonthMap: CategoryMonthMap | null;
  selectedCategoryIds: CategoryId[];
  currentMonthName: string;
  hasSelectedCategories: boolean;
};

// Output
export type CategoryBreakdownState = {
  hasSelectedCategories: boolean;
  currentMonthName: string;

  view: CategoryBreakdownView;

  totals: ReturnType<typeof computeTotals>;

  open: boolean;
  toggleOpen: () => void;
};

type CategoryBreakdownView = "single" | "multiple";

export function useCategoryBreakdown({
  currentMonthMap,
  previousMonthMap,
  selectedCategoryIds,
  currentMonthName,
  hasSelectedCategories,
}: UseCategoryBreakdownParams): CategoryBreakdownState {
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

  const view = selectedCategoryIds.length === 1 ? "single" : "multiple";
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
