import {
  type UpdateCategoryResponse,
  type ApiBudgetSnapshot,
} from "@/core/types/exported-types";

export function renameCategoryResult(
  snapshot: ApiBudgetSnapshot,
  categoryId: string,
  name: string
): UpdateCategoryResponse {
  const category = snapshot.categories.user[categoryId];

  category.name = name;

  return {
    updated: {
      category: category,
      // disabled because tested in e2e tests
      categories: [],
    },
  };
}
