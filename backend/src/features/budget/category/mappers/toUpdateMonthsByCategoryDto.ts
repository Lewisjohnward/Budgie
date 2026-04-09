import { categoryMapper } from "../category.mapper";
import { type CategoryId, type DomainMonth } from "../category.types";
import { type UpdatedMonthsByCategoryDto } from "../types/month.dto";

/**
 * Converts a record of domain months grouped by category into a DTO format.
 *
 * @param updatedMonthsByCategory - An object mapping category IDs to arrays of DomainMonth objects
 * @returns A DTO where each category ID maps to an array of month DTOs
 */
export const mapMonthsByCategoryToDto = (
  updatedMonthsByCategory: Record<CategoryId, DomainMonth[]>
): UpdatedMonthsByCategoryDto => {
  return Object.fromEntries(
    Object.entries(updatedMonthsByCategory).map(([categoryId, months]) => [
      categoryId,
      months.map(categoryMapper.toMonthDto),
    ])
  );
};
