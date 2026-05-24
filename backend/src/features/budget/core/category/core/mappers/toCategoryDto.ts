import { type DomainCategory } from "../category.types";
import { type CategoryDto } from "../types/category.dto";

/**
 * Converts a DomainCategory object into a CategoryDto for API responses.
 *
 * @param category - The domain category to convert
 * @returns The corresponding CategoryDto
 */
export const toCategoryDto = (category: DomainCategory): CategoryDto => {
  return {
    id: category.id,
    categoryGroupId: category.categoryGroupId,
    name: category.name,
    position: category.position,
  };
};
