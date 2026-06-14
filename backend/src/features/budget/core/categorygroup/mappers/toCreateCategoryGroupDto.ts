import { type CreateCategoryGroupResult } from "../categoryGroup.contract";
import { type CreateCategoryGroupDto } from "../categoryGroup.types";

export const toCreateCategoryGroupDto = (
  result: CreateCategoryGroupResult
): CreateCategoryGroupDto => {
  const createdCategoryGroup = result.createdCategoryGroup;

  return {
    created: {
      categoryGroup: createdCategoryGroup,
    },
  };
};
