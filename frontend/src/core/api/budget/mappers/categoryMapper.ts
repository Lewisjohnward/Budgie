import {
  asCategoryId,
  asCategoryGroupId,
} from "@/pages/budget/allocation/types/types";
import { ApiCategoryUser } from "@/core/types/exported-types";
import { CategoryUserBranded } from "@/core/types/NormalizedData";

export const mapCategory = (
  category: ApiCategoryUser
): CategoryUserBranded => ({
  ...category,
  id: asCategoryId(category.id),
  categoryGroupId: asCategoryGroupId(category.categoryGroupId),
});
