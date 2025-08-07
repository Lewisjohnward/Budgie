import { CategoryGroup, Category, Month } from "@/core/types/Allocation";
import {
  FundingState,
  FundingStatus,
  MonthsToUpdate,
} from "../types/assignTypes";
import { roundToCents } from "@/pages/budget/utils/currency";

export const generateSpentLastMonthState = (
  categoryGroups: Record<string, CategoryGroup>,
  categories: Record<string, Category>,
  currentMonths: Month[],
  lastMonths: Month[]
): { monthsToUpdate: MonthsToUpdate[]; uiState: FundingState } => {
  const monthsToUpdate: MonthsToUpdate[] = [];
  const lastMonthsMap = new Map<string, Month>();
  for (const month of lastMonths) {
    lastMonthsMap.set(month.categoryId, month);
  }

  const monthsToAlignByGroup = currentMonths.reduce(
    (acc, currentMonth) => {
      const lastMonth = lastMonthsMap.get(currentMonth.categoryId);
      if (
        lastMonth &&
        Math.abs(currentMonth.assigned) != Math.abs(lastMonth.activity)
      ) {
        monthsToUpdate.push({
          monthId: currentMonth.id,
          assigned: -lastMonth.activity,
        });

        const category = categories[currentMonth.categoryId];
        // this should not be called under any circumstances
        if (!category) return acc;

        const group = categoryGroups[category.categoryGroupId];
        // this should not be called under any circumstances
        if (!group) return acc;

        // this should not be called under any circumstances
        if (!acc[group.id]) {
          acc[group.id] = {
            name: group.name,
            categories: [],
          };
        }

        acc[group.id].categories.push({
          name: category.name,
          amount: -roundToCents(lastMonth.activity + currentMonth.assigned),
        });
      }

      return acc;
    },
    {} as Record<
      string,
      { name: string; categories: { name: string; amount: number }[] }
    >
  );

  return {
    monthsToUpdate,
    uiState: {
      status: FundingStatus.SpentLastMonth,
      categories: Object.values(monthsToAlignByGroup),
      noCategoriesToUpdate: monthsToUpdate.length === 0,
    },
  };
};
