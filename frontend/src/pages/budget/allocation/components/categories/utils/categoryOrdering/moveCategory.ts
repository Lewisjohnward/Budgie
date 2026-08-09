import { MappedCategoryGroupViewWithMetrics } from "@/pages/budget/allocation/hooks/useAllocation/useExpandableCategoryGroups";
import { asCategoryId } from "@/pages/budget/allocation/types/types";
import { UniqueIdentifier } from "@dnd-kit/core";
import { UpdatedCategory } from "../../hooks/useDragAndDrop";

type MoveCategoryResult = {
  view: MappedCategoryGroupViewWithMetrics[];
  updatedCategory: UpdatedCategory;
};

export function moveCategory(
  view: MappedCategoryGroupViewWithMetrics[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier
): MoveCategoryResult {
  const next = structuredClone(view);

  let fromGroup: any;
  let fromIndex: number | undefined;

  let toGroup: any;
  let toIndex: number | undefined;

  let droppedOnGroup = false;

  for (const g of next) {
    if (fromIndex === undefined) {
      const idx = g.rows.findIndex((r) => r.category.id === activeId);
      if (idx !== -1) {
        fromGroup = g;
        fromIndex = idx;
      }
    }

    if (g.group.id === overId) {
      toGroup = g;
      droppedOnGroup = true;
    }

    if (toIndex === undefined) {
      const idx = g.rows.findIndex((r) => r.category.id === overId);
      if (idx !== -1) {
        toGroup = g;
        toIndex = idx;
      }
    }
  }

  // if (!fromGroup || fromIndex === undefined || !toGroup) return null;

  const [moved] = fromGroup.rows.splice(fromIndex, 1);

  // Compute final index BEFORE insertion
  const finalIndex =
    droppedOnGroup || toIndex === undefined ? toGroup.rows.length : toIndex;

  toGroup.rows.splice(finalIndex, 0, moved);

  // Reflect new group id in moved item
  moved.category.categoryGroupId = toGroup.group.id;

  return {
    view: next,
    updatedCategory: {
      categoryId: asCategoryId(String(activeId)),
      categoryGroupId: toGroup.group.id,
      position: finalIndex,
    },
  };
}
