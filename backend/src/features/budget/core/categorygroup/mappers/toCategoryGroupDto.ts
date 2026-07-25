import {
  CategoryGroupSystemDto,
  DomainSystemCategoryGroup,
  type CategoryGroupUserDto,
  type DomainUserCategoryGroup,
} from "../categoryGroup.types";

/**
 * Converts a DomainUserCategoryGroup object into a CategoryGroupDto for API responses.
 *
 * @param categoryUserGroup - The domain categoryUserGroup to convert
 * @returns The corresponding CategoryGroupUserDto
 */
export const toCategoryGroupUserDto = (
  categoryGroup: DomainUserCategoryGroup
): CategoryGroupUserDto => {
  return {
    id: categoryGroup.id,
    name: categoryGroup.name,
    position: categoryGroup.position,
  };
};
/**
 * Converts a DomainSystemCategoryGroup object into a CategoryGroupSystemDto for API responses.
 *
 * @param categorySystemGroup - The domain categorySystemGroup to convert
 * @returns The corresponding CategoryGroupSystemDto
 */
export const toCategoryGroupSystemDto = (
  categoryGroup: DomainSystemCategoryGroup
): CategoryGroupSystemDto => {
  return {
    id: categoryGroup.id,
    name: categoryGroup.name,
  };
};
