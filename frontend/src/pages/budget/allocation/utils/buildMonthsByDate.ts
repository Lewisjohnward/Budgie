import { MonthBranded } from "@/core/types/NormalizedData";
import { CategoryMonthMap, MonthId, MonthKey } from "../types/types";
import { BuildMonthsByDateInvalidMonthKeyError } from "./buildMonthsByDate.errors";

/**
 * Builds a lookup structure that groups months by time bucket (MonthKey)
 * and then by category.
 *
 * This function transforms a flat record of `MonthBranded` entities into a
 * nested index for fast UI access:
 *
 * ```
 * MonthKey → CategoryId → MonthBranded
 * ```
 *
 * It uses the `monthKeys` array to initialize all expected buckets, then
 * populates them based on each month’s ISO `month` value (YYYY-MM),
 * which is sliced to derive the corresponding `MonthKey`.
 *
 * @important
 * This is a *derived view model*, not canonical data. It should always be
 * recomputed from `months` when the source changes.
 *
 * @param months - Flat record of all months keyed by `MonthId`
 * @param monthKeys - Ordered list of valid time buckets (YYYY-MM format)
 *
 * @returns A nested lookup table:
 * ```
 * Record<MonthKey, Record<CategoryId, MonthBranded>>
 * ```
 */
export function buildMonthsByDate(
  months: Record<MonthId, MonthBranded>,
  monthKeys: MonthKey[]
): Record<MonthKey, CategoryMonthMap> {
  const result: Record<MonthKey, CategoryMonthMap> = {};

  for (const key of monthKeys) {
    result[key] = {};
  }

  for (const month of Object.values(months)) {
    const key = month.month.slice(0, 7) as MonthKey;
    const categoryId = month.categoryId;

    if (!result[key]) {
      throw new BuildMonthsByDateInvalidMonthKeyError({
        monthId: month.id,
        derivedKey: key,
      });
    }

    result[key][categoryId] = month;
  }

  return result;
}
