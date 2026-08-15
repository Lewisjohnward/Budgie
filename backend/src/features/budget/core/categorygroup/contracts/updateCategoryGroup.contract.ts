import { DomainUserCategoryGroup } from "../categoryGroup.types";

/**
 * Domain result of the category group update use case.
 *
 * Represents the full set of state changes produced when updating a category group.
 * This includes both the primary category and any sibling category groups affected
 * by reordering.
 */
export type UpdateCategoryGroupResult = {
  /**
   * The category group that was directly updated (renamed or moved).
   */
  updatedCategoryGroup: DomainUserCategoryGroup;

  /**
   * Category groups that were indirectly affected by the update,
   * typically due to reordering within a group.
   *
   * This may include multiple categories whose positions or
   * group assignments were adjusted as a side effect of the operation.
   */
  affectedCategoryGroups: DomainUserCategoryGroup[];
};
