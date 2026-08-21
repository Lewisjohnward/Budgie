import {
  type UpdateCategoryResponse,
  type ApiBudgetSnapshot,
} from "@/core/types/exported-types";
import { type CategoryUserBranded } from "@/core/types/NormalizedData";

export function renameCategoryResult(
  snapshot: ApiBudgetSnapshot,
  categoryId: string,
  name: string
): UpdateCategoryResponse {
  const category = snapshot.categories.user[categoryId] as CategoryUserBranded;

  category.name = name;

  return {
    updated: {
      category: category,
      categories: [],
    },
  };
}
