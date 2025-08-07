import { CategoryGroup, Category, Month } from "@/core/types/Allocation";
import {
  FundingState,
  FundingStatus,
  MonthsToUpdate,
} from "../types/assignTypes";
import { calculateAverageSpent } from "./calculateAverageSpent";
import { roundToCents } from "@/pages/budget/utils/currency";

export const generateAverageSpentState = (
  categoryGroups: Record<string, CategoryGroup>,
  categories: Record<string, Category>,
  monthIndex: number,
  months: Month[]
): { monthsToUpdate: MonthsToUpdate[]; uiState: FundingState } => {
  const uniqueMonths = [...new Set(months.map((m) => m.month))];
  const currentMonthDate = uniqueMonths[monthIndex];

  // get current months
  const currentMonths = months.filter((m) => m.month === currentMonthDate);

  // Calculate average activity by category using shared utility
  const { averageActivityByCategory } = calculateAverageSpent(
    months,
    monthIndex
  );

  const monthsToUpdate: MonthsToUpdate[] = [];
  const monthsToAlignByGroup = currentMonths.reduce(
    (acc, currentMonth) => {
      const averageActivity = averageActivityByCategory.get(
        currentMonth.categoryId
      );

      if (
        averageActivity !== undefined &&
        currentMonth.assigned !== -averageActivity
      ) {
        monthsToUpdate.push({
          monthId: currentMonth.id,
          assigned: -averageActivity,
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
          amount: -roundToCents(averageActivity - currentMonth.assigned),
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
      status: FundingStatus.AverageSpent,
      categories: Object.values(monthsToAlignByGroup),
      noCategoriesToUpdate: monthsToUpdate.length === 0,
    },
  };
};
