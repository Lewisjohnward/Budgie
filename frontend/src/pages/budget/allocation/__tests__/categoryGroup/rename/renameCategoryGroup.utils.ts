import {
  type UpdateCategoryGroupResponse,
  type ApiBudgetSnapshot,
} from "@/core/types/exported-types";
import { type CategoryGroupBranded } from "@/core/types/NormalizedData";

export function renameCategoryGroupResult(
  snapshot: ApiBudgetSnapshot,
  categoryGroupId: string,
  name: string
): UpdateCategoryGroupResponse {
  // get category group
  const categoryGroup = snapshot.categoryGroups.user[
    categoryGroupId
  ] as CategoryGroupBranded;

  categoryGroup.name = name;

  return categoryGroup;
}
