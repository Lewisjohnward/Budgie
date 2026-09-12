import { MappedCategoryGroupViewWithMetrics } from "@/pages/budget/allocation/hooks/useAllocation/useExpandableCategoryGroups";
import { CategoryGroupId } from "@/pages/budget/allocation/types/types";
import { UniqueIdentifier } from "@dnd-kit/core";

export type MoveCategoryGroupResult = {
  view: MappedCategoryGroupViewWithMetrics[];
  updatedGroup: {
    categoryGroupId: CategoryGroupId;
    position: number;
  };
};

export function moveCategoryGroup(
  view: MappedCategoryGroupViewWithMetrics[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier
): MoveCategoryGroupResult {
  const next = structuredClone(view);

  const fromIndex = next.findIndex((g) => g.group.id === activeId);
  const toIndex = next.findIndex((g) => g.group.id === overId);

  if (fromIndex === -1 || toIndex === -1) {
    throw new Error("Category group not found");
  }

  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return {
    view: next,
    updatedGroup: {
      categoryGroupId: moved.group.id,
      position: toIndex,
    },
  };
}
