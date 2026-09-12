import {
  CategoryUserBranded,
  CategoryGroupUserBranded,
  MonthBranded,
} from "@/core/types/NormalizedData";
import {
  FundingOption,
  FundingState,
  MonthsToUpdate,
} from "../components/assign/types/assignTypes";
import {
  generateUnderfundedState,
  generateAssignedLastMonthState,
  generateSpentLastMonthState,
  generateAverageAssignedState,
  calculateAverageSpent,
  generateAverageSpentState,
  generateResetAssignedState,
  generateResetAvailableState,
} from "../components/assign/utils";
import { calculateAverageAssigned } from "../components/assign/utils/calculateAverageAssigned";

export type Allocation = {
  categories: Record<string, CategoryUserBranded>;
  categoryGroups: Record<string, CategoryGroupUserBranded>;

  currentMonths: MonthBranded[];
  previousMonths: MonthBranded[];
  previousYearMonths: MonthBranded[];

  rtaAvailable: number;
  ignoreRtaAvailable: boolean;
};

type Strategy = {
  amount: (allocation: Allocation) => number;
  build: (allocation: Allocation) => {
    monthsToUpdate: MonthsToUpdate[];
    uiState: FundingState;
  };
};

export const autoAssignStrategies: Record<FundingOption, Strategy> = {
  [FundingOption.UNDERFUNDED]: {
    amount: (allocation) => {
      const unfunded = allocation.currentMonths
        .filter((m) => m.available < 0)
        .reduce((acc, m) => acc + m.available, 0);

      return -unfunded;
    },
    build: generateUnderfundedState,
  },

  [FundingOption.ASSIGN_LAST_MONTH]: {
    amount: (allocation) =>
      allocation.previousMonths.reduce((sum, m) => sum + m.assigned, 0),

    build: generateAssignedLastMonthState,
  },

  [FundingOption.SPENT_LAST_MONTH]: {
    amount: (allocation) =>
      -allocation.previousMonths.reduce((sum, m) => sum + m.activity, 0),

    build: generateSpentLastMonthState,
  },

  [FundingOption.AVERAGE_ASSIGNED]: {
    amount: (allocation) => {
      const { totalAverageAssigned } = calculateAverageAssigned(
        allocation.previousYearMonths
      );
      return totalAverageAssigned;
    },
    build: generateAverageAssignedState,
  },

  [FundingOption.AVERAGE_SPENT]: {
    amount: (allocation) => {
      const { totalAverageSpend } = calculateAverageSpent(
        allocation.previousYearMonths
      );
      return -totalAverageSpend;
    },
    build: generateAverageSpentState,
  },

  [FundingOption.RESET_ASSIGNED]: {
    amount: () => 0,
    build: generateResetAssignedState,
  },

  [FundingOption.RESET_AVAILABLE]: {
    amount: () => 0,
    build: generateResetAvailableState,
  },
} as const;
