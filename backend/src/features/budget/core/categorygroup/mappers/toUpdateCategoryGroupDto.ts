import { type UpdateCategoryGroupDto } from "../categoryGroup.types";
import { type UpdateCategoryGroupResult } from "../contracts/updateCategoryGroup.contract";

/**
 * Maps domain category group update result into a frontend-friendly patch DTO.
 *
 * Only position changes are included for affected category groups.
 */
export const toUpdateCategoryGroupDto = (
  result: UpdateCategoryGroupResult
): UpdateCategoryGroupDto => {
  return {
    updated: {
      categoryGroup: result.updatedCategoryGroup,
      categoryGroups: result.affectedCategoryGroups.map((categoryGroup) => ({
        id: categoryGroup.id,
        position: categoryGroup.position,
      })),
    },
  };
};
