import {
  FundingState,
  FundingStatus,
  MonthsToUpdate,
} from "../types/assignTypes";
import { AllocationContext } from "../../../hooks/useAllocation/useCategoryViewModel";

export const generateResetAvailableState = (
  allocationContext: AllocationContext
): { monthsToUpdate: MonthsToUpdate[]; uiState: FundingState } => {
  const { currentMonths, categories, categoryGroups } = allocationContext;

  const monthsToResetAvailable = currentMonths.filter((m) => m.available !== 0);

  const monthsToReset: MonthsToUpdate[] = [];

  for (const month of monthsToResetAvailable) {
    if (month.available !== 0) {
      monthsToReset.push({
        monthId: month.id,
        assigned: month.assigned + -month.available,
      });
    }
  }

  const monthsToResetByGroup = monthsToResetAvailable.reduce(
    (acc, month) => {
      const category = categories[month.categoryId];
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
        amount: -month.available,
      });

      return acc;
    },
    {} as Record<
      string,
      { name: string; categories: { name: string; amount: number }[] }
    >
  );

  return {
    monthsToUpdate: monthsToReset,
    uiState: {
      status: FundingStatus.ResetAssigned,
      categories: Object.values(monthsToResetByGroup),
      noCategoriesToUpdate: monthsToReset.length === 0,
    },
  };
};
