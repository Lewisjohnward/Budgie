import { Brand } from "../../../../../shared/types/brand";
import { UserId } from "../../../../user/auth/auth.types";
import { CategoryId } from "../../category/core/category.types";
import { CategoryGroupSource } from "../categoryGroup.constants";

/**
 * Branded type representing a CategoryGroup identifier to prevent mixing with other string-based IDs.
 */
export type CategoryGroupId = Brand<string, "CategoryGroupId">;

/**
 * Type-safe helper to cast a raw string into a CategoryGroupId.
 */
export const asCategoryGroupId = (id: string) => id as CategoryGroupId;

/**
 * Core domain model representing a system CategoryGroup without relationship data.
 */
export type DomainSystemCategoryGroup = {
  id: CategoryGroupId;
  name: string;
  source: CategoryGroupSource.SYSTEM;
};

/**
 * Core domain model representing a user CategoryGroup without relationship data.
 */
export type DomainUserCategoryGroup = {
  id: CategoryGroupId;
  name: string;
  source: CategoryGroupSource.USER;
  position: number;
};

export type DomainCategoryGroup =
  | DomainUserCategoryGroup
  | DomainSystemCategoryGroup;

/**
 * Domain model of a CategoryGroup that includes associated category IDs.
 */
export type DomainCategoryGroupWithCategoryIds = {
  id: CategoryGroupId;
  name: string;
  position: number;
  categoryIds: CategoryId[];
};

/**
 * Internal data required to create a user category group including resolved position.
 */
export type CreateCategoryGroupData = {
  userId: UserId;
  name: string;
  position: number;
};
