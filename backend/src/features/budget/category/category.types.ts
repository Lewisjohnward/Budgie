import { Month, Prisma } from "@prisma/client";

export type NormalizedCategories = {
  categoryGroups: {
    [key: string]: NormalizedCategoryGroup;
  };
  categories: {
    [key: string]: NormalizedCategory;
  };
  months: {
    [key: string]: NormalizedMonth;
  };
};

type NormalizedCategoryGroup = Omit<CategoryGroup, "categories" | "userId"> & {
  categories: string[];
};

type NormalizedCategory = Omit<Category, "months"> & {
  months: string[];
  categoryGroupId: string;
};

type NormalizedMonth = Omit<Month, "activity" | "assigned" | "available"> & {
  categoryId: string;
  activity: number;
  assigned: number;
  available: number;
};

type CategoryGroup = Prisma.CategoryGroupGetPayload<{
  include: { categories: { include: { months: true } } };
}>;

type Category = Prisma.CategoryGetPayload<{
  include: { months: true };
}>;

type Account = Prisma.AccountGetPayload<{
  include: {
    transactions: {
      include: { category: { include: { categoryGroup: true } } };
    };
  };
}>;

type Transaction = Prisma.TransactionGetPayload<{
  include: { category: true };
}>;

export type { CategoryGroup, Category, Month, Account, Transaction };
