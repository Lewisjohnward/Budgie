import { type ApiBudgetSnapshot } from "@/core/types/exported-types";
import { type CategoryGroupBranded } from "@/core/types/NormalizedData";
import { UpdateCategoryGroupDto } from "@/core/api/budget/categoryGroup/CategoryGroupApiSlice";

export function renameCategoryGroupResult(
  snapshot: ApiBudgetSnapshot,
  categoryGroupId: string,
  name: string
): UpdateCategoryGroupDto {
  // get category group
  const categoryGroup = snapshot.categoryGroups.user[
    categoryGroupId
  ] as CategoryGroupBranded;

  categoryGroup.name = name;

  return categoryGroup;
}
