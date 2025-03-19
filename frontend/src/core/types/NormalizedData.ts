export type Account = {
  id: string;
  userId: string;
  name: string;
  type: "BANK" | "CREDIT_CARD";
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  transactions: Transaction[];
};

export type Transaction = {
  id: string;
  accountId: string;
  categoryId: string;
  date: Date;
  inflow: number | null;
  outflow: number | null;
  payee: string | null;
  memo: string | null;
  cleared: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
};

export type Category = {
  id: string;
  userId: string;
  // type: "EXPENSE" | "INCOME";
  name: string;
};

export type NormalizedData = {
  accounts: { [key: string]: Account };
  transactions: { [key: string]: Transaction };
  categories: { [key: string]: Category };
};

type CategoryGroup = {
  id: string;
  name: string;
  categories: string[];
};

export type CategoryT = {
  id: string;
  userId: string;
  categoryId: string;
  // type: "EXPENSE" | "INCOME";
  name: string;
  assigned: number;
  activity: number;
};

export type CategoriesNormalizedData = {
  categoryGroups: { [key: string]: CategoryGroup };
  categories: { [key: string]: CategoryT };
};

export type MappedCategoryGroups = { open: boolean } & CategoryGroup;

export type CategoriesDataMapped = {
  categoryGroups: { [key: string]: MappedCategoryGroups };
  categories: { [key: string]: CategoryT };
};
