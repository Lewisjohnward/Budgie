import {
  type UpdateCategoryGroupResponse,
  type ApiBudgetSnapshot,
} from "@/core/types/exported-types";

export function renameCategoryGroupResult(
  snapshot: ApiBudgetSnapshot,
  categoryGroupId: string,
  name: string
): UpdateCategoryGroupResponse {
  const categoryGroup = snapshot.categoryGroups.user[categoryGroupId];

  const updatedCategoryGroup = {
    ...categoryGroup,
    name,
  };

  return {
    updated: {
      categoryGroup: updatedCategoryGroup,
      // disabled because tested in e2e tests
      categoryGroups: [],
    },
  };
}
