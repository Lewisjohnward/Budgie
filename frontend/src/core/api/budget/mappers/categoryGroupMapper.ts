import { ApiCategoryGroupUser } from "@/core/types/exported-types";
import { CategoryGroupUserBranded } from "@/core/types/NormalizedData";
import { asCategoryGroupId } from "@/pages/budget/allocation/types/types";

export const mapCategoryGroup = (
  categoryGroup: ApiCategoryGroupUser
): CategoryGroupUserBranded => ({
  ...categoryGroup,
  id: asCategoryGroupId(categoryGroup.id),
});
