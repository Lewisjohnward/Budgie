import { type ApiBudgetSnapshot } from "@/core/types/exported-types";
import { type CategoryBranded } from "@/core/types/NormalizedData";
import { UpdateCategoryDto } from "@/core/api/budget/category/categoryApiSlice";

export function renameCategoryResult(
  snapshot: ApiBudgetSnapshot,
  categoryId: string,
  name: string
): UpdateCategoryDto {
  const category = snapshot.categories.user[categoryId] as CategoryBranded;

  category.name = name;

  return {
    updated: {
      category: category,
      categories: [],
    },
  };
}
