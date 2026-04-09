export type MonthsToUpdate = {
  monthId: string;
  assigned: string;
};

export type UpdateMonthsPayload = {
  assignments: MonthsToUpdate[];
};

export type MonthDto = {
  id: string;
  categoryId: string;
  month: string;
  activity: string;
  assigned: string;
  available: string;
};

export type UpdatedMonthsByCategoryDto = Record<string, MonthDto[]>;

export enum FundingOption {
  UNDERFUNDED = "underfunded",
  ASSIGN_LAST_MONTH = "assignLastMonth",
  SPENT_LAST_MONTH = "spentLastMonth",
  AVERAGE_ASSIGNED = "averageAssigned",
  AVERAGE_SPENT = "averageSpent",
  RESET_ASSIGNED = "resetAssigned",
  RESET_AVAILABLE = "resetAvailable",
}

export enum FundingStatus {
  Underfunded = "underfunded",
  AssignedLastMonth = "assigned last month",
  SpentLastMonth = "spent last month",
  AverageAssigned = "average assigned",
  AverageSpent = "average spent",
  ResetAssigned = "reset assigned amount",
  ResetAvailable = "reset available amount",
}

export interface Category {
  name: string;
  amount: number;
}

export interface CategoryGroup {
  name: string;
  categories: Category[];
}

export enum FundingLevel {
  NoMoney = "noMoney",
  Funded = "funded",
  AlreadyFunded = "alreadyFunded",
}

export type PartiallyFundedCategory = Category & { percentFunded: number };

export type PartiallyFundedCategoryGroup = Omit<CategoryGroup, "categories"> & {
  category: PartiallyFundedCategory;
};

type UnderfundedState = {
  status: FundingStatus.Underfunded;
  fundingLevel: FundingLevel;
  fullyFundedCategories: CategoryGroup[];
  partiallyFundedCategory?: PartiallyFundedCategoryGroup;
};

export type NonUnderfundedFundingState = {
  status:
    | FundingStatus.AssignedLastMonth
    | FundingStatus.SpentLastMonth
    | FundingStatus.AverageAssigned
    | FundingStatus.AverageSpent
    | FundingStatus.ResetAssigned
    | FundingStatus.ResetAvailable;
  noCategoriesToUpdate: boolean;
  categories: CategoryGroup[];
};

export type FundingState = UnderfundedState | NonUnderfundedFundingState;
