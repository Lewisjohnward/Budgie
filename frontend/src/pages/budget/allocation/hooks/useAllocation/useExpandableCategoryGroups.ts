import {
  CategoryGroup,
  Category,
  Month,
  MappedCategoryGroup,
} from "@/core/types/Allocation";
import { useState } from "react";

type UseExpandableCategoryGroupsParams = {
  categoryGroups: Record<string, CategoryGroup>;
  categories: Record<string, Category>;
  months: Record<string, Month>;
  monthIndex: number;
  protectedGroupIds: {
    rtaCategoryGroupId: string;
    uncategorisedCategoryGroupId: string;
  };
};

export function useExpandableCategoryGroups({
  categoryGroups,
  categories,
  months,
  monthIndex,
  protectedGroupIds,
}: UseExpandableCategoryGroupsParams) {
  // Initialize open state for all groups (all open by default)
  const [openState, setOpenState] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(categoryGroups).forEach((id) => {
      initial[id] = true;
    });
    return initial;
  });

  // Calculate derived groups with financial data and open state
  const derivedGroups: MappedCategoryGroup[] = Object.entries(categoryGroups)
    .filter(
      ([key]) =>
        key !== protectedGroupIds.rtaCategoryGroupId &&
        key !== protectedGroupIds.uncategorisedCategoryGroupId
    )
    .map(([id, group]) => {
      const assigned = group.categories.reduce((sum, categoryId) => {
        const category = categories[categoryId];
        const m = months[category.months[monthIndex]];
        return sum + m.assigned;
      }, 0);

      const activity = group.categories.reduce((sum, categoryId) => {
        const category = categories[categoryId];
        const m = months[category.months[monthIndex]];
        return sum + m.activity;
      }, 0);

      const available = assigned + activity;

      return {
        ...group,
        open: openState[id],
        assigned: assigned.toFixed(2),
        activity: activity.toFixed(2),
        available: available.toFixed(2),
      };
    });

  const atLeastOneOpen = derivedGroups.some((group) => group.open);

  const expandAll = () => {
    setOpenState((prev) => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach((id) => {
        newState[id] = !atLeastOneOpen;
      });
      return newState;
    });
  };

  const expandOne = (groupId: string) => {
    setOpenState((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return {
    categoryGroups: derivedGroups,
    atLeastOneGroupOpen: atLeastOneOpen,
    expandAllCategoryGroups: expandAll,
    expandCategoryGroup: expandOne,
  };
}

export type ExpandableCategoryGroupsType = ReturnType<
  typeof useExpandableCategoryGroups
>;
