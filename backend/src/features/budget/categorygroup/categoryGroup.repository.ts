import { Prisma } from "@prisma/client";
import {
  type CreateCategoryGroupData,
  type EditCategoryGroupData,
} from "./categorygroup.schema";
import { type CategoryGroupId, db } from "./categoryGroup.types";
import { type UserId } from "../../user/auth/auth.types";

export interface CategoryGroupRepository {
  getCategoryGroup(
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId
  ): Promise<db.CategoryGroup | null>;

  /** Retrieves all category groups belonging to a specific user. */
  getCategoryGroups(userId: UserId): Promise<db.CategoryGroup[]>;

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

  /**
   * Returns true if a category group with the given name exists for the user.
   */
  existsCategoryGroupByName(
    tx: Prisma.TransactionClient,
    userId: UserId,
    name: string
  ): Promise<boolean>;

  createCategoryGroup(
    tx: Prisma.TransactionClient,
    categoryGroup: CreateCategoryGroupData
  ): Promise<void>;

  updateCategoryGroup(
    tx: Prisma.TransactionClient,
    categoryGroup: EditCategoryGroupData
  ): Promise<void>;

  deleteCategoryGroup(
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId
  ): Promise<void>;
}
