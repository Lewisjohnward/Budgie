export type AllocationData = {
  months: Record<string, MonthData>;
  categoryGroups: Record<string, CategoryGroup>;
  categories: Record<string, Category>;
};

type MonthData = {
  id: string;
  month: string;
  categoryGroupIds: string[];
  totalSpent: number;
  totalBudget: number;
};

type CategoryGroup = {
  id: string;
  name: string;
  categoryIds: string[];
  budgetLimit: number;
  totalSpent: Record<string, number>;
};

type Category = {
  id: string;
  name: string;
  amounts: Record<string, number>;
  categoryGroupId: string;
  budgetLimit: number;
  totalSpent: Record<string, number>;
};

export type MappedMonthData = MonthData & {
  current: boolean;
  formattedDate: string;
};

export type MappedCategoryGroup = CategoryGroup & {
  open: boolean;
};

export type MappedAllocationData = {
  months: Record<string, MappedMonthData>;
  categoryGroups: Record<string, MappedCategoryGroup>;
  categories: Record<string, Category>;
};
