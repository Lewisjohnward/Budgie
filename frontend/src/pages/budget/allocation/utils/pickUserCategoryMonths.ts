import { MonthBranded, CategoryUserBranded } from "@/core/types/NormalizedData";
import { CategoryId } from "../types/types";

export function pickUserCategoryMonths(
  categoryMonthMap: Record<CategoryId, MonthBranded>,
  userCategories: Record<CategoryId, CategoryUserBranded>
): Record<CategoryId, MonthBranded> {
  const result: Record<CategoryId, MonthBranded> = {};

  for (const [categoryId, month] of Object.entries(categoryMonthMap)) {
    if (userCategories[categoryId as CategoryId]) {
      result[categoryId as CategoryId] = month;
    }
  }

  return result;
}
