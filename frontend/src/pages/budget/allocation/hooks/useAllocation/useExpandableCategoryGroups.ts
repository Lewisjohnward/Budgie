import { useMemo, useState } from "react";
import { CategoryGroupId } from "../../types/types";
import {
  CategoryGroupWithMetrics,
  CategoryGroupViewWithMetrics,
} from "../../utils/assembleCategoryGroupViews";
import { CategoryViewRow } from "../../utils/buildCategoryViewModel";

export type ExpandableCategoryGroups = {
  categoryGroups: MappedCategoryGroupViewWithMetrics[];
  atLeastOneGroupOpen: boolean;
  expandAllCategoryGroups: () => void;
  expandCategoryGroup: (groupId: CategoryGroupId) => void;
  displayGlobalExpand: boolean;
};
export type MappedCategoryGroupViewWithMetrics = {
  group: CategoryGroupWithMetrics;
  rows: CategoryViewRow[];
  open: boolean;
};

/**
 * React hook that derives expandable category groups with calculated financial
 * aggregates for a given month index.
 *
 * This hook:
 * - Maps raw category groups into UI-ready groups (`MappedCategoryGroup`)
 * - Computes financial totals (assigned, activity, available) per group
 * - Tracks open/closed UI state per category group
 * - Provides utilities to expand/collapse groups individually or collectively
 *
 * The financial values are derived by:
 * - Resolving each category's month entry via `category.months[monthIndex]`
 * - Summing `assigned` and `activity` across all categories in a group
 *
 * @param {Object} params - Hook parameters
 * @param {Record<string, CategoryGroup>} params.categoryGroups
 * Raw category group dictionary keyed by group ID.
 *
 * @param {Record<string, Category>} params.categories
 * Category dictionary keyed by category ID.
 *
 * @param {Record<string, Month>} params.months
 * Month dictionary keyed by month ID, containing financial values.
 *
 * @param {number} params.monthIndex
 * Index used to resolve the active month from each category's month mapping.
 *
 * @param {Object} params.protectedGroupIds
 * IDs for system-protected groups (e.g. rta, uncategorised).
 * Currently unused in this hook but reserved for filtering logic.
 *
 * @returns {ExpandableCategoryGroups} Derived UI state and actions:
 * - `categoryGroups`: mapped groups with computed financial totals and open state
 * - `atLeastOneGroupOpen`: whether any group is currently expanded
 * - `expandAllCategoryGroups`: toggles all groups open/closed
 * - `expandCategoryGroup`: toggles a single group by ID
 */
export function useExpandableCategoryGroups(
  categoryGroups: CategoryGroupViewWithMetrics[]
): ExpandableCategoryGroups {
  const [openState, setOpenState] = useState<Record<CategoryGroupId, boolean>>(
    () => {
      const initial: Record<CategoryGroupId, boolean> = {};

      for (const group of categoryGroups) {
        initial[group.group.id] = true;
      }

      return initial;
    }
  );

  const derivedGroups: MappedCategoryGroupViewWithMetrics[] = useMemo(() => {
    return categoryGroups.map((group) => ({
      ...group,
      open: openState[group.group.id] ?? true,
    }));
  }, [categoryGroups, openState]);

  const atLeastOneOpen = useMemo(
    () => derivedGroups.some((g) => g.open),
    [derivedGroups]
  );

  const expandAll = () => {
    setOpenState((prev) => {
      const next: Record<CategoryGroupId, boolean> = {};

      for (const id of Object.keys(prev)) {
        next[id as CategoryGroupId] = !atLeastOneOpen;
      }

      return next;
    });
  };

  const expandOne = (groupId: CategoryGroupId) => {
    setOpenState((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const displayGlobalExpand = categoryGroups.length > 0;

  return {
    displayGlobalExpand,
    categoryGroups: derivedGroups,
    atLeastOneGroupOpen: atLeastOneOpen,
    expandAllCategoryGroups: expandAll,
    expandCategoryGroup: expandOne,
  };
}
