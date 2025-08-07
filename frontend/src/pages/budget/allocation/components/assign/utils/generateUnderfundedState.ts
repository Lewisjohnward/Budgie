import { CategoryGroup, Category, Month } from "@/core/types/Allocation";
import {
  FundingStatus,
  FundingLevel,
  FundingState,
} from "../types/assignTypes";
import { MonthsToUpdate } from "../types/assignTypes";
import { roundToCents } from "@/pages/budget/utils/currency";

/**
 * Calculates funding allocations for underfunded categories and generates UI state.
 *
 * @param categoryGroups - Map of category group IDs to category group objects
 * @param categories - Map of category IDs to category objects
 * @param currentMonths - Array of month records to evaluate for funding
 * @param rtaAvailable - Ready To Assign amount available for allocation
 * @param ignoreRtaAvailable - If true, funds all underfunded categories regardless of RTA limit
 *
 * @returns Object containing:
 *   - monthsToUpdate: Array of month IDs with new assigned amounts
 *   - uiState: Funding status and category groupings for display
 *
 * @remarks
 * - Only processes months with negative available amounts
 * - When ignoreRtaAvailable is true, assigns the full amount to each month
 * - When ignoreRtaAvailable is false, respects RTA limit and may partially fund
 * - UI state breaks after first partially funded category for display purposes
 */

export const generateUnderfundedState = (
  categoryGroups: Record<string, CategoryGroup>,
  categories: Record<string, Category>,
  currentMonths: Month[],
  rtaAvailable: number,
  ignoreRtaAvailable: boolean = false
): { monthsToUpdate: MonthsToUpdate[]; uiState: FundingState } => {
  debugger;
  const unfundedMonths = currentMonths.filter((m) => m.available < 0);

  const monthsToFund: MonthsToUpdate[] = [];
  if (unfundedMonths.length && ignoreRtaAvailable) {
    for (const month of unfundedMonths) {
      const currentAvailable = month.available;
      monthsToFund.push({
        monthId: month.id,
        assigned: roundToCents(-currentAvailable),
      });
    }
  } else if (unfundedMonths.length > 0) {
    let rta = rtaAvailable;

    for (const month of unfundedMonths) {
      if (rta <= 0) break;

      const amountToFund = -month.available;
      const currentAssigned = month.assigned;

      if (rta >= amountToFund) {
        // Full funding
        monthsToFund.push({
          monthId: month.id,
          assigned: roundToCents(currentAssigned + amountToFund),
        });
        rta = roundToCents(rta - amountToFund);
      } else {
        // Partial funding
        monthsToFund.push({
          monthId: month.id,
          assigned: roundToCents(currentAssigned + rta),
        });
        rta = 0;
      }
    }
  }

  if (monthsToFund.length === 0) {
    return {
      monthsToUpdate: monthsToFund,
      uiState: {
        status: FundingStatus.Underfunded,
        fundingLevel:
          rtaAvailable <= 0 ? FundingLevel.NoMoney : FundingLevel.AlreadyFunded,
        fullyFundedCategories: [],
      },
    };
  }

  const fundedCategoriesByGroup: Record<
    string,
    { name: string; categories: { name: string; amount: number }[] }
  > = {};

  let partiallyFundedCategory: {
    name: string;
    category: { name: string; amount: number; percentFunded: number };
  } | null = null;

  for (const action of monthsToFund) {
    const month = unfundedMonths.find((m) => m.id === action.monthId);
    if (!month) continue;

    const category = categories[month.categoryId];
    if (!category) continue;

    const group = categoryGroups[category.categoryGroupId];
    if (!group) continue;

    if (!fundedCategoriesByGroup[group.id]) {
      fundedCategoriesByGroup[group.id] = {
        name: group.name,
        categories: [],
      };
    }

    const amountFunded = roundToCents(action.assigned - (month.assigned || 0));

    if (amountFunded < -month.available) {
      // Partially funded
      const percentFunded = Math.round((amountFunded / -month.available) * 100);
      partiallyFundedCategory = {
        name: group.name,
        category: {
          name: category.name,
          amount: amountFunded,
          percentFunded,
        },
      };
      // Stop after the first partially funded category
      break;
    } else {
      // Fully funded
      fundedCategoriesByGroup[group.id].categories.push({
        name: category.name,
        amount: amountFunded,
      });
    }
  }

  return {
    monthsToUpdate: monthsToFund,
    uiState: {
      status: FundingStatus.Underfunded,
      fundingLevel: FundingLevel.Funded,
      fullyFundedCategories: Object.values(fundedCategoriesByGroup).filter(
        (g) => g.categories.length > 0
      ),
      ...(partiallyFundedCategory && { partiallyFundedCategory }),
    },
  };
};
