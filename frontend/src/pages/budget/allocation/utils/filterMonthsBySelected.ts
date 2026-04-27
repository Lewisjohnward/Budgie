import { MonthBranded } from "@/core/types/NormalizedData";
import { CategoryId } from "../types/types";

// Input
type FilterMonthsBySelectedParams = {
  current: MonthBranded[];
  previous: MonthBranded[];
  previousYear: MonthBranded[];
  selectedCategoriesIds: CategoryId[];
};

// Output
type FilteredMonths = {
  current: MonthBranded[];
  previous: MonthBranded[];
  previousYear: MonthBranded[];
};

export function filterMonthsBySelected(
  params: FilterMonthsBySelectedParams
): FilteredMonths {
  const { current, previous, previousYear, selectedCategoriesIds } = params;

  const selectedCategoryIdsSet = new Set(selectedCategoriesIds);

  if (selectedCategoryIdsSet.size === 0) {
    return {
      current,
      previous,
      previousYear,
    };
  }

  const filter = <T extends { categoryId: CategoryId }>(items: T[]) =>
    items.filter((item) => selectedCategoryIdsSet.has(item.categoryId));

  return {
    current: filter(current),
    previous: filter(previous),
    previousYear: filter(previousYear),
  };
}
