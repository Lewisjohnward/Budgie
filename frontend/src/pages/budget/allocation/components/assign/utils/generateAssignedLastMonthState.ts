import { CategoryGroup, Category, Month } from "@/core/types/Allocation";
import {
  FundingState,
  FundingStatus,
  MonthsToUpdate,
} from "../types/assignTypes";
import { roundToCents } from "@/pages/budget/utils/currency";

export const generateAssignedLastMonthState = (
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
      if (lastMonth && currentMonth.assigned !== lastMonth.assigned) {
        monthsToUpdate.push({
          monthId: currentMonth.id,
          assigned: lastMonth.assigned,
        });

        const category = categories[currentMonth.categoryId];
        if (!category) return acc;

        const group = categoryGroups[category.categoryGroupId];
        if (!group) return acc;

        if (!acc[group.id]) {
          acc[group.id] = {
            name: group.name,
            categories: [],
          };
        }

        acc[group.id].categories.push({
          name: category.name,
          amount: roundToCents(lastMonth.assigned - currentMonth.assigned),
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
      status: FundingStatus.AssignedLastMonth,
      categories: Object.values(monthsToAlignByGroup),
      noCategoriesToUpdate: monthsToUpdate.length === 0,
    },
  };
};
