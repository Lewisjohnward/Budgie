import { Month, Prisma } from "@prisma/client";

export type NormalisedCategories = {
  categoryGroups: {
    [key: string]: NormalisedCategoryGroup;
  };
  categories: {
    [key: string]: NormalisedCategory;
  };
  months: {
    [key: string]: NormalisedMonth;
  };
};

type NormalisedCategoryGroup = Omit<CategoryGroup, "categories" | "userId"> & {
  categories: string[];
};

type NormalisedCategory = Omit<Category, "months"> & {
  months: string[];
  categoryGroupId: string;
};

type NormalisedMonth = Omit<
  Month,
  "activity" | "assigned" | "available" | "month"
> & {
  month: string;
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
