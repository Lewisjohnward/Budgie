import type {
  Category as PrismaCategory,
  Month as PrismaMonth,
  Prisma,
} from "@prisma/client";

export type NormalisedData = NormalisedCategoryData & {
  monthKeys: string[];
  memoByMonth: MemoByMonth;
};

export type NormalisedCategoryData = {
  categoryGroups: CategoryGroupById;
  categories: CategoryById;
  months: MonthById;
};

export type CategoryGroupById = Record<
  CategoryGroupId,
  NormalisedCategoryGroup
>;
export type CategoryById = Record<CategoryId, NormalisedCategory>;
export type MonthById = Record<MonthId, NormalisedMonth>;

type Brand<T, B extends string> = T & { readonly __brand: B };

export type CategoryGroupId = Brand<string, "CategoryGroupId">;
export type CategoryId = Brand<string, "CategoryId">;
export type MonthId = Brand<string, "MonthId">;

export const asCategoryGroupId = (id: string) => id as CategoryGroupId;
export const asCategoryId = (id: string) => id as CategoryId;
export const asMonthId = (id: string) => id as MonthId;

export type MemoByMonth = Record<string, MemoSummary>;

export type MemoSummary = {
  id: string;
  month: string;
  content: string;
};

/**
 * Prisma payloads (DB shapes)
 */

export type MonthMemo = Prisma.MonthMemoGetPayload<{
  select: {
    id: true;
    month: true;
    content: true;
  };
}>;

export type CategoryGroupWithCategoriesAndMonths =
  Prisma.CategoryGroupGetPayload<{
    include: { categories: { include: { months: true } } };
  }>;

export type CategoryWithMonths = Prisma.CategoryGetPayload<{
  include: { months: true };
}>;

export type Account = Prisma.AccountGetPayload<{
  include: {
    transactions: {
      include: { category: { include: { categoryGroup: true } } };
    };
  };
}>;

/**
 * Normalized entity types (built from Prisma payloads)
 */

type NormalisedCategoryGroup = Omit<
  CategoryGroupWithCategoriesAndMonths,
  "categories" | "userId"
> & {
  categories: CategoryId[];
};

type NormalisedCategory = Omit<CategoryWithMonths, "months"> & {
  months: MonthId[];
  categoryGroupId: CategoryGroupId;
};

type NormalisedMonth = Omit<
  PrismaMonth,
  "activity" | "assigned" | "available" | "month"
> & {
  month: string;
  categoryId: CategoryId;
  activity: number;
  assigned: number;
  available: number;
};

export type Category = PrismaCategory;
