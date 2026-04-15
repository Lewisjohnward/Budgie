import { Brand } from "../../../../shared/types/brand";
import { CategoryId } from "../../category/core/category.types";

/**
 * Branded type representing a CategoryGroup identifier to prevent mixing with other string-based IDs.
 */
export type CategoryGroupId = Brand<string, "CategoryGroupId">;

/**
 * Type-safe helper to cast a raw string into a CategoryGroupId.
 */
export const asCategoryGroupId = (id: string) => id as CategoryGroupId;

/**
 * Core domain model representing a CategoryGroup without relationship data.
 */
export type DomainCategoryGroup = {
  id: CategoryGroupId;
  name: string;
  position: number;
};

/**
 * Domain model of a CategoryGroup that includes associated category IDs.
 */
export type DomainCategoryGroupWithCategoryIds = {
  id: CategoryGroupId;
  name: string;
  position: number;
  categoryIds: CategoryId[];
};
