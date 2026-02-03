import type {
  Prisma,
  Category as PrismaCategory,
  Month as PrismaMonth,
} from "@prisma/client";

/**
 * ============================
 * Prisma payloads (DB shapes)
 * ============================
 *
 * These types represent data as it comes directly from Prisma
 */

/**
 * Minimal MonthMemo payload used by the category normaliser.
 */
export type MonthMemo = Prisma.MonthMemoGetPayload<{
  select: {
    id: true;
    month: true;
    content: true;
  };
}>;

/**
 * Category group including its categories and their months.
 */
export type CategoryGroupWithCategoriesAndMonths =
  Prisma.CategoryGroupGetPayload<{
    include: { categories: { include: { months: true } } };
  }>;

/**
 * Account including transactions with their categories and groups.
 */
export type Account = Prisma.AccountGetPayload<{
  include: {
    transactions: {
      include: { category: { include: { categoryGroup: true } } };
    };
  };
}>;

export type Category = PrismaCategory;
export type Month = PrismaMonth;
export type MonthUpdate = Pick<PrismaMonth, "id" | "activity" | "available" | "assigned">;
