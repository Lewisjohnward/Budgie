import {
  FundingState,
  FundingStatus,
  MonthsToUpdate,
} from "../types/assignTypes";
import { calculateAverageSpent } from "./calculateAverageSpent";
import { roundToCents } from "@/pages/budget/utils/currency";
import { AllocationContext } from "../../../hooks/useAllocation/useCategoryViewModel";

export const generateAverageSpentState = (
  allocationContext: AllocationContext
): { monthsToUpdate: MonthsToUpdate[]; uiState: FundingState } => {
  const { currentMonths, previousYearMonths, categories, categoryGroups } =
    allocationContext;

  // Calculate average activity by category using shared utility
  const { averageActivityByCategory } =
    calculateAverageSpent(previousYearMonths);

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
