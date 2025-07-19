export type AllocationData = {
  months: Record<string, Month>;
  categoryGroups: Record<string, CategoryGroup>;
  categories: Record<string, Category>;
};

type Month = {
  id: string;
  month: string;
  activity: number;
  assigned: number;
  available: number;
  categoryGroupIds: string[];
  totalSpent: number;
  totalBudget: number;
};

type CategoryGroup = {
  id: string;
  name: string;
  categories: string[];
  budgetLimit: number;
  totalSpent: Record<string, number>;
};

type Category = {
  id: string;
  userId: string;
  name: string;
  amounts: Record<string, number>;
  categoryGroupId: string;
  budgetLimit: number;
  totalSpent: Record<string, number>;
  months: string[];
};

export type MappedMonth = Month & {
  current: boolean;
  formattedDate: string;
};

export type MappedCategoryGroup = CategoryGroup & {
  open: boolean;
  assigned: string;
  activity: string;
  available: string;
};

export type MappedAllocationData = {
  months: Record<string, MappedMonth>;
  categoryGroups: Record<string, MappedCategoryGroup>;
  categories: Record<string, Category>;
};
