import { type UpdateCategoryResult } from "../contracts/updateCategory.contract";
import { categoryMapper } from "../category.mapper";
import {
  type UpdateCategoryDto,
  type CategoryPositionPatch,
} from "../types/category.dto";

/**
 * Maps domain update result into a frontend-friendly patch DTO.
 *
 * Only position and categoryGroupId changes are included for affected categories.
 */
export function toUpdateCategoryDto(
  result: UpdateCategoryResult
): UpdateCategoryDto {
  const patches: CategoryPositionPatch[] = result.affectedCategories.map(
    (category) => ({
      id: category.id,
      position: category.position,
      categoryGroupId: category.categoryGroupId,
    })
  );

  return {
    updated: {
      category: categoryMapper.toCategoryDto(result.updatedCategory),
      categories: patches,
    },
  };
}
