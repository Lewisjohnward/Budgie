import {
  CategoryBranded,
  CategoryGroupBranded,
  MonthBranded,
} from "@/core/types/NormalizedData";
import { CategoryGroupId, CategoryId } from "../types/types";

// Input
export type CategoryGroupsWithMetricsParams = Record<
  CategoryGroupId,
  {
    id: CategoryGroupId;
    name: string;
    position: number;

    assigned: number;
    activity: number;
    available: number;
  }
>;

// Output
type BuildCategoryGroupMetrics = {
  categoryGroups: Record<CategoryGroupId, CategoryGroupBranded>;
  categories: Record<CategoryId, CategoryBranded>;
  currentUserCategoryMonthMap: Record<CategoryId, MonthBranded>;
};

/**
 * Computes aggregated financial metrics for each category group for a given month.
 *
 * This function transforms normalized category, group, and month data into a
 * structure keyed by `CategoryGroupId`, where each group contains summed values:
 * - `assigned`: total assigned amount across all categories in the group
 * - `activity`: total activity (typically spending) across all categories
 * - `available`: computed as `assigned + activity`
 *
 * ---
 * Design responsibilities:
 *
 * 1. **Initialization**
 *    - Ensures every category group is present in the result
 *
 * 2. **Aggregation**
 *    - Iterates over the current month’s category data
 *    - Resolves each category → category group relationship
 *    - Accumulates financial values per group
 *
 * 3. **Finalization**
 *    - Derives `available` as `assigned + activity` for each group
 *
 * ---
 * Invariants:
 *
 * This function assumes the input data is structurally valid and enforces:
 *
 * - Every `categoryId` in `currentCategoryMonthMap` MUST exist in `categories`
 * - Every category MUST reference a valid `categoryGroupId` present in `categoryGroups`
 *
 * Violations of these invariants will throw an error
 *
 * ---
 * @param params - Input data required to compute group metrics
 * @param params.categoryGroups - All category groups indexed by ID
 * @param params.categories - All categories indexed by ID (source of group relationships)
 * @param params.currentCategoryMonthMap - Month data indexed by category ID for the active month
 *
 * @returns A record keyed by `CategoryGroupId`, where each entry contains
 * aggregated financial metrics for that group
 */
export function buildCategoryGroupMetrics(
  params: BuildCategoryGroupMetrics
): CategoryGroupsWithMetricsParams {
  const { categoryGroups, categories, currentUserCategoryMonthMap } = params;

  const result: CategoryGroupsWithMetricsParams = {};

  // init groups
  for (const group of Object.values(categoryGroups)) {
    result[group.id] = {
      id: group.id,
      name: group.name,
      position: group.position,
      assigned: 0,
      activity: 0,
      available: 0,
    };
  }
  // accumulate
  for (const [categoryId, month] of Object.entries(
    currentUserCategoryMonthMap
  ) as [CategoryId, MonthBranded][]) {
    const category = categories[categoryId];

    if (!category) {
      throw new Error(`Missing category for categoryId: ${categoryId}`);
    }

    const groupId = category.categoryGroupId;
    const group = result[groupId];

    if (!group) {
      throw new Error(
        `Missing category group for categoryId: ${categoryId}, groupId: ${category.categoryGroupId}`
      );
    }

    group.assigned += month.assigned;
    group.activity += month.activity;
    group.available += month.available;
  }
  return result;
}
