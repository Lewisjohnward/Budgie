import { Category, Month, Prisma } from "@prisma/client";
import { CreateCategoryData } from "./category.schema";
export interface CategoryRepository {
  // ──────────────── Category Retrieval ────────────────

  getCategory(
    tx: Prisma.TransactionClient,
    userId: string,
    categoryId: string,
  ): Promise<Category | null>;

  getCategoryIdByGroupAndName(
    tx: Prisma.TransactionClient,
    userId: string,
    categoryGroupId: string,
    name: string,
  ): Promise<string | null>;

  getAllCategoryIds(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<{ id: string }[]>;

  getMaxCategoryPositionInGroup(
    tx: Prisma.TransactionClient,
    categoryGroupId: string,
  ): Promise<number | null>;

  getProtectedCategoryIds(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<string[]>;

  getRtaCategoryId(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<string>;

  getUncategorisedCategoryId(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<string>;

  // ──────────────── Category Mutation ────────────────

  createCategory(
    tx: Prisma.TransactionClient,
    category: CreateCategoryData,
  ): Promise<Category>;

  updateCategory(
    tx: Prisma.TransactionClient,
    categoryId: string,
    name?: string,
    categoryGroupId?: string,
  ): Promise<void>;

  deleteCategory(
    tx: Prisma.TransactionClient,
    categoryId: string,
  ): Promise<void>;

  // ──────────────── Month Retrieval ────────────────

  getMonth(
    tx: Prisma.TransactionClient,
    userId: string,
    categoryId: string,
  ): Promise<Month>;

  getExistingMonths(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<{ month: Date }[]>;

  getPastMonths(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<{ month: Date }[]>;

  getAllMonthsForCategories(
    tx: Prisma.TransactionClient,
    userId: string,
    rtaCategoryId: string,
  ): Promise<Month[]>;

  getMonthsForCategoriesStartingFrom(
    tx: Prisma.TransactionClient,
    categoryIds: string[],
    month: Date,
  ): Promise<Month[]>;

  getAllRtaMonths(
    tx: Prisma.TransactionClient,
    userId: string,
    rtaCategoryId: string,
  ): Promise<Month[]>;

  // ──────────────── Month Mutation ────────────────

  createMonths(
    tx: Prisma.TransactionClient,
    months: Prisma.MonthCreateManyInput[],
  ): Promise<void>;

  deleteMonthsByCategoryId(
    tx: Prisma.TransactionClient,
    categoryId: string,
  ): Promise<void>;

  updateMonths(
    tx: Prisma.TransactionClient,
    updatedCategoryMonths: Month[],
  ): Promise<void>;
}
