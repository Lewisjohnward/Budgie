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

export const useDragAndDrop = ({ categoriesByGroup }: UseDragAndDropProps) => {
  const [active, setActive] = useState<{
    id: UniqueIdentifier | null;
    type: "group" | "category" | null;
  }>({ id: null, type: null });
  const [draftView, setDraftView] = useState(categoriesByGroup);
  const [updatedCategory, setUpdatedCategory] =
    useState<UpdatedCategory | null>(null);
  const [updatedCategoryGroup, setUpdatedCategoryGroup] =
    useState<UpdatedCategoryGroup | null>(null);

  const [updateCategory] = useUpdateCategoryMutation();
  const [updateCategoryGroup] = useUpdateCategoryGroupMutation();

  useEffect(() => {
    setDraftView((current) => mergeCategoryGroups(current, categoriesByGroup));
  }, [categoriesByGroup]);

  const onDragStart = (event: DragStartEvent) => {
    setActive({
      id: event.active.id,
      type: event.active.data.current?.type ?? null,
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (active.data.current?.type === "group") {
      return;
    }

    const { view, updatedCategory } = moveCategory(draftView, activeId, overId);

    setDraftView(view);
    setUpdatedCategory(updatedCategory);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActive({ id: null, type: null });
      return;
    }

    if (active.data.current?.type === "group") {
      const activeId = active.id as CategoryGroupId;
      const overId = over.id as CategoryGroupId;

      if (activeId !== overId) {
        const { view, updatedGroup } = moveCategoryGroup(
          draftView,
          activeId,
          overId
        );

        setDraftView(view);
        setUpdatedCategoryGroup(updatedGroup);
      }
    }

    if (updatedCategory) {
      updateCategory(updatedCategory);
      setUpdatedCategory(null);
    }

    if (updatedCategoryGroup) {
      updateCategoryGroup(updatedCategoryGroup);
      setUpdatedCategoryGroup(null);
    }

    setActive({ id: null, type: null });
  };

  const onDragCancel = () => {
    setDraftView(categoriesByGroup);

    setUpdatedCategory(null);
    setUpdatedCategoryGroup(null);

    setActive({ id: null, type: null });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const activeCategory = useMemo(() => {
    return draftView
      .flatMap((g) => g.rows)
      .find((r) => r.category.id === active.id);
  }, [active, draftView]);

  const activeCategoryGroup = useMemo(() => {
    return draftView.find((g) => g.group.id === active.id);
  }, [active, draftView]);

  const isDraggingCategoryGroup = active.type === "group";

  const isDragging = active.id !== null;

  return {
    sensors,
    activeCategory,
    activeCategoryGroup,
    activeId: active.id,
    draftView,
    isDraggingCategoryGroup,
    isDragging,
    onDragStart,
    onDragOver,
    onDragCancel,
    onDragEnd,
  };
};
