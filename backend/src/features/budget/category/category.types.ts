import { Month, Prisma } from "@prisma/client";

export type NormalisedCategoryData = {
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

type MemoByMonth = Record<
  string,
  { id: string; month: string; content: string }
>;

export type NormalisedData = NormalisedCategoryData & {
  monthKeys: string[];
  memoByMonth: MemoByMonth;
};

export type Memo = Prisma.MonthMemoGetPayload<{
  select: {
    id: true;
    month: true;
    content: true;
  };
}>;

type NormalisedCategoryGroup = Omit<
  CategoryGroupWithCategoriesAndMonths,
  "categories" | "userId"
> & {
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

type CategoryGroupWithCategoriesAndMonths = Prisma.CategoryGroupGetPayload<{
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

export type {
  CategoryGroupWithCategoriesAndMonths,
  Category,
  Month,
  Account,
  Transaction,
};
