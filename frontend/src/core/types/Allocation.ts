export type AllocationData = {
  months: Record<string, Month>;
  categoryGroups: Record<string, CategoryGroup>;
  categories: Record<string, Category>;
};

export type Month = {
  id: string;
  month: string;
  activity: number;
  assigned: number;
  available: number;
  categoryId: string;
};

export type CategoryGroup = {
  id: string;
  name: string;
  categories: string[];
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  categoryGroupId: string;
  position: number;
  months: string[];
  transactions: string[];
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
