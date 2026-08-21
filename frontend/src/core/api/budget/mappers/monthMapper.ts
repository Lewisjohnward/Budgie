import {
  asCategoryId,
  asMonthId,
  asMonthKey,
} from "@/pages/budget/allocation/types/types";
import { MonthBranded } from "@/core/types/NormalizedData";
import { ApiMonth } from "@/core/types/exported-types";

export const mapMonth = (month: ApiMonth): MonthBranded => ({
  ...month,
  id: asMonthId(month.id),
  categoryId: asCategoryId(month.categoryId),
  month: asMonthKey(month.month),
});
