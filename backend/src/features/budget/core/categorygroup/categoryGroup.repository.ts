import { Prisma } from "@prisma/client";
import { type CreateCategoryGroupData } from "./categorygroup.schema";
import { type CategoryGroupId, db } from "./categoryGroup.types";
import { type UserId } from "../../../user/auth/auth.types";

export interface CategoryGroupRepository {
  /**
   * Retrieves a USER category group for the given user within a transaction.
   * Returns null if no matching USER category group exists.
   */
  getUserCategoryGroup(
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId
  ): Promise<db.CategoryGroup | null>;

  getCategoryGroupById(
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId
  ): Promise<db.CategoryGroup | null>;

  /**
   * Retrieves all category groups belonging to a specific user.
   */
  getCategoryGroups(userId: UserId): Promise<db.CategoryGroup[]>;

  /**
   * Retrieves all user category groups belonging to a specific user.
   */
  getUserCategoryGroups(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<db.CategoryGroup[]>;

  existsCategoryGroup(
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId
  ): Promise<boolean>;

  /**
   * Returns true if the given category group is protected for the user.
   */
  isProtectedCategoryGroup(
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId
  ): Promise<boolean>;

  createCategoryGroup(
    tx: Prisma.TransactionClient,
    payload: CreateCategoryGroupData
  ): Promise<db.CategoryGroup>;

  /**
   * Renames a category group for a given id.
   */
  renameCategoryGroup(
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId,
    name: string
  ): Promise<db.CategoryGroup>;

  /**
   * Returns the number of user-owned category groups for a given user.
   */
  getUserCategoryGroupCount(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<number>;

  /**
   * Shifts user category groups down within a position range (used when moving an item forward).
   */
  shiftUserCategoryGroupsDown(
    tx: Prisma.TransactionClient,
    userId: UserId,
    fromPosition: number,
    toPosition: number
  ): Promise<void>;

  /**
   * Shifts user category groups up within a position range (used when moving an item backward).
   */
  shiftUserCategoryGroupsUp(
    tx: Prisma.TransactionClient,
    userId: UserId,
    fromPosition: number,
    toPosition: number
  ): Promise<void>;

  /**
   * Updates the position of a category group by id.
   */
  updateCategoryGroupPosition(
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId,
    position: number
  ): Promise<db.CategoryGroup>;

  deleteCategoryGroup(
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId
  ): Promise<void>;

  /**
   * Shifts all user category groups after a deleted position down by one to maintain continuous ordering.
   */
  shiftAfterDelete(
    tx: Prisma.TransactionClient,
    userId: UserId,
    deletedPosition: number
  ): Promise<void>;
}
