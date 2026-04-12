import { type DomainCategoryGroup } from "../categoryGroup.types";
import { type CategoryGroupMap } from "../types/categoryGroup.dto";

/**
 * Normalises an array of category groups into a lookup map keyed by group ID.
 *
 * @param groups - Array of category group DTOs from the API
 * @returns Record keyed by categoryGroupId
 */
export const normaliseCategoryGroups = (
  groups: DomainCategoryGroup[]
): CategoryGroupMap => {
  return groups.reduce<CategoryGroupMap>((acc, group) => {
    acc[group.id] = group;
    return acc;
  }, {});
};
