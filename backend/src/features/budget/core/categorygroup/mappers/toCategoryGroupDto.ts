import {
  type CategoryGroupUserDto,
  type DomainUserCategoryGroup,
} from "../categoryGroup.types";

/**
 * Converts a DomainCategoryGroup object into a CategoryGroupDto for API responses.
 *
 * @param categoryGroup - The domain categoryGroup to convert
 * @returns The corresponding CategoryGroupDto
 */
export const toCategoryGroupDto = (
  categoryGroup: DomainUserCategoryGroup
): CategoryGroupUserDto => {
  return {
    id: categoryGroup.id,
    name: categoryGroup.name,
    position: categoryGroup.position,
  };
};
