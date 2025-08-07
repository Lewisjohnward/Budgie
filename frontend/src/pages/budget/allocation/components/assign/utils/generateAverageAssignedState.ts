import { CategoryGroup, Category, Month } from "@/core/types/Allocation";
import {
  FundingState,
  FundingStatus,
  MonthsToUpdate,
} from "../types/assignTypes";
import { calculateAverageAssigned } from "./calculateAverageAssigned";
import { roundToCents } from "@/pages/budget/utils/currency";

export const generateAverageAssignedState = (
  categoryGroups: Record<string, CategoryGroup>,
  categories: Record<string, Category>,
  monthIndex: number,
  months: Month[]
): { monthsToUpdate: MonthsToUpdate[]; uiState: FundingState } => {
  const uniqueMonths = [...new Set(months.map((m) => m.month))];
  const currentMonthDate = uniqueMonths[monthIndex];

  // get current months
  const currentMonths = months.filter((m) => m.month === currentMonthDate);

  const { averageAssignedByCategory } = calculateAverageAssigned(
    months,
    monthIndex
  );

  const monthsToUpdate: MonthsToUpdate[] = [];
  const monthsToAlignByGroup = currentMonths.reduce(
    (acc, currentMonth) => {
      const averageAssigned = averageAssignedByCategory.get(
        currentMonth.categoryId
      );

      if (
        averageAssigned !== undefined &&
        currentMonth.assigned !== averageAssigned
      ) {
        monthsToUpdate.push({
          monthId: currentMonth.id,
          assigned: averageAssigned,
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
          amount: roundToCents(averageAssigned - currentMonth.assigned),
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
      status: FundingStatus.AverageAssigned,
      categories: Object.values(monthsToAlignByGroup),
      noCategoriesToUpdate: monthsToUpdate.length === 0,
    },
  };
};
