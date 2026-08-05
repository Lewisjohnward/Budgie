import { type DomainUserCategory } from "../category.types";

/**
 * Domain result of the category update use case.
 *
 * Represents the full set of state changes produced when updating a category.
 * This includes both the primary category and any sibling categories affected
 * by reordering or group changes.
 */
export type UpdateCategoryResult = {
  /**
   * The category that was directly updated (renamed or moved).
   */
  updatedCategory: DomainUserCategory;

  /**
   * Categories that were indirectly affected by the update,
   * typically due to reordering within a group.
   *
   * This may include multiple categories whose positions or
   * group assignments were adjusted as a side effect of the operation.
   */
  affectedCategories: DomainUserCategory[];
};
