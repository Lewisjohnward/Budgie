import { type DomainCategory } from "../category.types";
import { type CategoryDto } from "../types/category.dto";

/**
 * Converts a DomainMonth object into a MonthDto for API responses.
 *
 * @param month - The domain month to convert
 * @returns The corresponding MonthDto with number numeric fields and ISO date
 */
export const toCategoryDto = (category: DomainCategory): CategoryDto => {
  return {
    id: category.id,
    categoryGroupId: category.categoryGroupId,
    name: category.name,
    position: category.position,
  };
};
