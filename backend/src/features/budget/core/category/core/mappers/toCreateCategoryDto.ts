import { type CreateCategoryResult } from "../category.contract";
import { categoryMapper } from "../category.mapper";
import { type MonthDto } from "../category.types";
import { type CreateCategoryDto } from "../types/category.dto";

/**
 * Maps the domain result of a category creation use case into a DTO suitable for API responses.
 *
 * This function transforms the created category and its associated months from domain models
 * into serializable DTOs expected by the client. Months are indexed by their ID for fast lookup
 * on the frontend.
 *
 * @param result - The domain result containing the created category and its generated months
 * @returns A DTO representing the newly created category and its months
 */
export const toCreateCategoryDto = (
  result: CreateCategoryResult
): CreateCategoryDto => {
  const months: Record<string, MonthDto> = {};

  for (const month of result.createdMonths) {
    months[month.id] = categoryMapper.toMonthDto(month);
  }

  return {
    created: {
      category: categoryMapper.toCategoryDto(result.createdCategory),
      months,
    },
  };
};
