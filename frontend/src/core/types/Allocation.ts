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
