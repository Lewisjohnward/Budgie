import { CategoryGroup, Category, Month } from "@/core/types/Allocation";
import {
  FundingState,
  FundingStatus,
  MonthsToUpdate,
} from "../types/assignTypes";

export const generateResetAssignedState = (
  categoryGroups: Record<string, CategoryGroup>,
  categories: Record<string, Category>,
  currentMonths: Month[]
): { monthsToUpdate: MonthsToUpdate[]; uiState: FundingState } => {
  const monthsToResetAssigned = currentMonths.filter((m) => m.assigned !== 0);

  const monthsToReset: MonthsToUpdate[] = [];

  for (const month of monthsToResetAssigned) {
    if (month.assigned !== 0) {
      monthsToReset.push({
        monthId: month.id,
        assigned: 0,
      });
    }
  }

  const monthsToResetByGroup = monthsToResetAssigned.reduce((acc, month) => {
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
      amount: -month.assigned,
    });

    return acc;
  }, {} as Record<string, { name: string; categories: { name: string; amount: number }[] }>);

  return {
    monthsToUpdate: monthsToReset,
    uiState: {
      status: FundingStatus.ResetAssigned,
      categories: Object.values(monthsToResetByGroup),
      noCategoriesToUpdate: monthsToReset.length === 0,
    },
  };
};
