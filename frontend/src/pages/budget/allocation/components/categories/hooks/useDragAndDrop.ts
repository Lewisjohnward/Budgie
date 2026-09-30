import { useUpdateCategoryMutation } from "@/core/api/budget/category/categoryApiSlice";
import { useUpdateCategoryGroupMutation } from "@/core/api/budget/categoryGroup/CategoryGroupApiSlice";
import {
  UniqueIdentifier,
  useSensors,
  useSensor,
  PointerSensor,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useState, useEffect, useMemo } from "react";
import { MappedCategoryGroupViewWithMetrics } from "../../../hooks/useAllocation/useExpandableCategoryGroups";
import { CategoryId, CategoryGroupId } from "../../../types/types";
import { moveCategoryGroup } from "../utils/categoryOrdering/moveCategoryGroup";
import { moveCategory } from "../utils/categoryOrdering/moveCategory";
import { mergeCategoryGroups } from "../utils/categoryOrdering/mergeCategoryGroups";

type UseDragAndDropProps = {
  categoriesByGroup: MappedCategoryGroupViewWithMetrics[];
};

export type UpdatedCategory = {
  categoryId: CategoryId;
  categoryGroupId: CategoryGroupId;
  position: number;
};

export type UpdatedCategoryGroup = {
  categoryGroupId: CategoryGroupId;
  position: number;
};

type ActiveDrag = {
  id: UniqueIdentifier | null;
  type: "group" | "category" | null;
};

/**
 * Manages category and category-group drag-and-drop.
 *
 * `displayView` is the category view rendered by the UI. During a drag it is
 * updated to reflect the prospective ordering before the final order is
 * persisted.
 *
 * Category dragging is handled continuously during `onDragOver`:
 * - Over another category, the category is reordered normally.
 * - Over an open, populated group, the category is moved to the start of that
 *   group.
 * - Over an empty or closed group, the category remains in its current
 *   position and `categoryOverGroupId` is used to render the special drop zone.
 *
 * Category-group dragging is not handled during `onDragOver`; its ordering is
 * only updated and persisted on `onDragEnd`.
 *
 * Cancelling a drag restores `displayView` to `categoriesByGroup`.
 */
export const useDragAndDrop = ({ categoriesByGroup }: UseDragAndDropProps) => {
  const [active, setActive] = useState<ActiveDrag>({ id: null, type: null });
  const [displayView, setDisplayView] = useState(categoriesByGroup);
  const [categoryOverGroupId, setCategoryOverGroupId] =
    useState<CategoryGroupId | null>(null);
  const [updateCategory] = useUpdateCategoryMutation();
  const [updateCategoryGroup] = useUpdateCategoryGroupMutation();

  const resetDragState = () => {
    setCategoryOverGroupId(null);
    setActive({ id: null, type: null });
  };

  useEffect(() => {
    setDisplayView((current) =>
      mergeCategoryGroups(current, categoriesByGroup)
    );
  }, [categoriesByGroup]);

  const onDragStart = (event: DragStartEvent) => {
    setActive({
      id: event.active.id,
      type: event.active.data.current?.type ?? null,
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || active.data.current?.type !== "category") {
      return;
    }

    const overType = over.data.current?.type;

    if (overType === "group") {
      const groupId = over.id as CategoryGroupId;

      const group = displayView.find(({ group }) => group.id === groupId);

      if (!group) {
        setCategoryOverGroupId(null);
        return;
      }

      if (!group.open || group.rows.length === 0) {
        setCategoryOverGroupId(groupId);
        return;
      }

      setCategoryOverGroupId(null);

      const firstCategory = group.rows[0];

      const { view } = moveCategory(
        displayView,
        active.id,
        firstCategory.category.id
      );

      setDisplayView(view);

      return;
    }

    setCategoryOverGroupId(null);

    const { view } = moveCategory(displayView, active.id, over.id);

    setDisplayView(view);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const type = active.data.current?.type;

    if (!over) {
      setDisplayView(categoriesByGroup);
      resetDragState();
      return;
    }

    if (type === "group") {
      const activeId = active.id;
      const overId = over.id;

      if (activeId !== overId) {
        const { view, updatedGroup } = moveCategoryGroup(
          displayView,
          activeId,
          overId
        );

        setDisplayView(view);

        await updateCategoryGroup(updatedGroup).unwrap();
      }
    } else if (type === "category") {
      const { view, updatedCategory } = moveCategory(
        displayView,
        active.id,
        over.id
      );

      setDisplayView(view);

      await updateCategory(updatedCategory).unwrap();
    }

    resetDragState();
  };

  const onDragCancel = () => {
    setDisplayView(categoriesByGroup);
    resetDragState();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const activeCategory = useMemo(() => {
    return displayView
      .flatMap((g) => g.rows)
      .find((r) => r.category.id === active.id);
  }, [active.id, displayView]);

  const activeCategoryGroup = useMemo(() => {
    return displayView.find((g) => g.group.id === active.id);
  }, [active.id, displayView]);

  const isDraggingCategoryGroup = active.type === "group";
  const isDraggingCategory = active.type === "category";
  const isDragging = active.id !== null;

  const isCategoryOverEmptyOrClosedGroup = (groupId: CategoryGroupId) => {
    if (categoryOverGroupId !== groupId) return false;

    const group = displayView.find(({ group }) => group.id === groupId);

    return group ? !group.open || group.rows.length === 0 : false;
  };

  const isDraggingCategoryOverEmptyOrClosedGroup =
    isDraggingCategory &&
    categoryOverGroupId !== null &&
    isCategoryOverEmptyOrClosedGroup(categoryOverGroupId);

  return {
    sensors,
    activeCategory,
    activeCategoryGroup,
    activeId: active.id,
    displayView,
    isDraggingCategoryGroup,
    isDraggingCategory,
    isCategoryOverEmptyOrClosedGroup,
    isDraggingCategoryOverEmptyOrClosedGroup,
    isDragging,
    onDragStart,
    onDragOver,
    onDragCancel,
    onDragEnd,
  };
};
