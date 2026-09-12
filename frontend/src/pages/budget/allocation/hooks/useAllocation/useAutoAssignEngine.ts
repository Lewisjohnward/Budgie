import {
  CategoryUserBranded,
  CategoryGroupUserBranded,
  MonthBranded,
} from "@/core/types/NormalizedData";
import {
  FundingState,
  FundingOption,
  MonthsToUpdate,
} from "../../components/assign/types/assignTypes";
import { autoAssignStrategies } from "../../utils/autoAssignStrategies";
import { CategoryId } from "../../types/types";
import { filterMonthsBySelected } from "../../utils/filterMonthsBySelected";

// Input
type AutoAssignEngineParams = {
  categories: Record<string, CategoryUserBranded>;
  categoryGroups: Record<string, CategoryGroupUserBranded>;

  currentMonths: MonthBranded[];
  previousMonths: MonthBranded[];
  previousYearMonths: MonthBranded[];

  rtaAvailable: number;
  selectedCategoryIds: CategoryId[];
  updateMonths: (m: MonthsToUpdate[]) => void;
  autoAccept: boolean;
  modal: {
    open: (payload: {
      uiState: FundingState;
      monthsToUpdate: MonthsToUpdate[];
    }) => void;
  };
};

// Output
export type AutoAssignEngine = {
  assignAmount: (action: FundingOption) => number;
  runAction: (action: FundingOption) => void;
};

export const useAutoAssignEngine = ({
  categories,
  categoryGroups,

  currentMonths,
  previousMonths,
  previousYearMonths,

  rtaAvailable,
  updateMonths,
  selectedCategoryIds,
  modal,
  autoAccept,
}: AutoAssignEngineParams): AutoAssignEngine => {
  // Filter months by selected categories
  const filteredMonths = filterMonthsBySelected({
    current: currentMonths,
    previous: previousMonths,
    previousYear: previousYearMonths,
    selectedCategoriesIds: selectedCategoryIds,
  });

  const runAction = (action: FundingOption) => {
    const strategy = autoAssignStrategies[action];
    const result = strategy.build({
      categories,
      categoryGroups,
      rtaAvailable,
      currentMonths: filteredMonths.current,
      previousMonths: filteredMonths.previous,
      previousYearMonths: filteredMonths.previousYear,
      ignoreRtaAvailable: autoAccept,
    });

    if (autoAccept) {
      if (result.monthsToUpdate.length === 0) return;
      updateMonths(result.monthsToUpdate);
    } else {
      modal.open(result);
    }
  };

  /**
   * Generate the total amount of assign strategy
   */
  const assignAmount = (action: FundingOption) =>
    autoAssignStrategies[action].amount({
      categories,
      categoryGroups,
      rtaAvailable,
      currentMonths: filteredMonths.current,
      previousMonths: filteredMonths.previous,
      previousYearMonths: filteredMonths.previousYear,
      ignoreRtaAvailable: autoAccept,
    });

  return {
    runAction,
    assignAmount,
  };
};
