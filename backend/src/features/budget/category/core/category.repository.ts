import { Prisma } from "@prisma/client";
import { type CreateCategoryData } from "./category.schema";
import { type CategoryId, type MonthId, db } from "./category.types";
import { type CategoryGroupId } from "../../categorygroup/categoryGroup.types";
import { type UserId } from "../../../user/auth/auth.types";
export interface CategoryRepository {
  // ──────────────── Category Retrieval ────────────────

  getCategory(
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryId: CategoryId
  ): Promise<db.Category | null>;

  getUserCategoryIds(
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryIds: CategoryId[]
  ): Promise<string[]>;

  existsCategoryWithNameInGroup(
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId,
    name: string
  ): Promise<boolean>;

  getAllCategoryIds(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<string[]>;

  getMaxCategoryPositionInGroup(
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId
  ): Promise<number | null>;

  getProtectedCategoryIds(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<string[]>;

  getRtaCategoryId(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<string | null>;

  getUncategorisedCategoryId(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<string | null>;

  // ──────────────── Category Mutation ────────────────

  createCategory(
    tx: Prisma.TransactionClient,
    categoryData: CreateCategoryData
  ): Promise<db.Category>;

  updateCategory(
    tx: Prisma.TransactionClient,
    categoryId: CategoryId,
    name?: string,
    categoryGroupId?: CategoryGroupId
  ): Promise<void>;

  deleteCategory(
    tx: Prisma.TransactionClient,
    categoryId: CategoryId
  ): Promise<void>;

  // ──────────────── Month Retrieval ────────────────

  getMonth(
    tx: Prisma.TransactionClient,
    userId: UserId,
    monthId: MonthId
  ): Promise<db.Month | null>;

  getExistingMonths(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<Date[]>;

  getMonthsForCategories(
    tx: Prisma.TransactionClient,
    categoryIds: CategoryId[]
  ): Promise<db.Month[]>;

  /**
   * Retrieves the earliest past month associated with any category
   * belonging to the specified user.
   *
   * This method queries the `Month` table scoped by `userId`
   * (via the related category) and returns the minimum `month`
   * value that is less than or equal to the current date.
   *
   * The function assumes an application-level invariant that
   * at least one past month exists for the user. If no such
   * month is found, an error should be thrown by the implementation.
   *
   * @param tx - Prisma transaction client used to execute the query
   * @param userId - Identifier of the user whose earliest past month
   * should be retrieved
   *
   * @returns A promise that resolves to the earliest past `Date`
   */
  getEarliestPastMonth(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<Date>;

  getAllMonthsForCategories(
    tx: Prisma.TransactionClient,
    userId: UserId,
    rtaCategoryId: CategoryId
  ): Promise<db.Month[]>;

  getMonthsForCategoriesStartingFrom(
    tx: Prisma.TransactionClient,
    categoryIds: CategoryId[],
    month: Date
  ): Promise<db.Month[]>;

  getAllRtaMonths(
    tx: Prisma.TransactionClient,
    userId: UserId,
    rtaCategoryId: CategoryId
  ): Promise<db.Month[]>;

  /** Retrieves months by their IDs for a specific user */
  getMonthsFromIds(
    tx: Prisma.TransactionClient,
    userId: UserId,
    monthIds: MonthId[]
  ): Promise<db.Month[]>;

  /**
   * Retrieves the most recent month entry for each category belonging to a user.
   *
   * @param tx - The Prisma transaction client.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an array of the most recent Month objects, one for each category.
   *
   */

  getMostRecentMonths(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<db.Month[]>;

  // ──────────────── Month Mutation ────────────────

  createMonths(
    tx: Prisma.TransactionClient,
    months: Prisma.MonthCreateManyInput[]
  ): Promise<void>;

  deleteMonthsByCategoryId(
    tx: Prisma.TransactionClient,
    categoryId: CategoryId
  ): Promise<void>;

  updateMonths(
    tx: Prisma.TransactionClient,
    updatedCategoryMonths: db.MonthUpdate[]
  ): Promise<void>;
}
