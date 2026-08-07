import { AddCategoryGroupPopover } from "../../popovers/AddCategoryGroupPopover";
import {
  CategoryGridRow,
  CategoryTableHeader,
  UncategorisedRow,
  CategoryGroupRow,
  AddCategoryGroupButton,
  CategoryRow,
} from "./components";
import { CategoryViewRow } from "../../utils/buildCategoryViewModel";
import {
  ExpandableCategoryGroupsState,
  MappedCategoryGroupViewWithMetrics,
} from "../../hooks/useAllocation/useExpandableCategoryGroups";
import { CategorySelectionState } from "../../hooks/useAllocation/useCategorySelection";
import {
  closestCenter,
  DndContext,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { asCategoryId, CategoryGroupId, CategoryId } from "../../types/types";
import { useEffect, useMemo, useState } from "react";

type CategoriesProps = {
  currency: string;
  view: {
    uncategorisedRow: CategoryViewRow;
    categoriesByGroup: MappedCategoryGroupViewWithMetrics[];
  };
  expandCategoryGroups: ExpandableCategoryGroupsState;
  categorySelector: CategorySelectionState;
  deleteState: {
    getCategoryDeleteState: (categoryId: CategoryId) => CategoryDeleteState;
    getCategoryGroupDeleteState: (
      categoryGroupId: CategoryGroupId
    ) => CategoryGroupDeleteState;
  };
  selectors: {
    getCategorySelectOptions: (
      exclude?: ExcludeTarget
    ) => CategorySelectOptions;
  };
  validators: {
    canRename: (target: ContextTarget, name: string) => boolean;
  };
};

export type DeleteCategoryArgs = {
  categoryId: CategoryId;
  inheritingCategoryId?: CategoryId;
};

export type DeleteCategoryTarget = {
  id: CategoryId;
  name: string;
};

export type DeleteCategoryGroupTarget = {
  id: CategoryGroupId;
  name: string;
};

export function Categories({
  currency,
  view,
  expandCategoryGroups,
  deleteState: { getCategoryDeleteState, getCategoryGroupDeleteState },
  selectors: { getCategorySelectOptions },
  validators: { canRename },
  categorySelector,
}: CategoriesProps) {
  const { uncategorisedRow, categoriesByGroup } = view;
  const [updateCategory] = useUpdateCategoryMutation();
  const [updateCategoryGroup] = useUpdateCategoryGroupMutation();

  useEffect(() => {
    setDraftView(categoriesByGroup);
  }, [categoriesByGroup]);

  function handleDragEnd() {
    if (updatedCategory) {
      updateCategory(updatedCategory);
      setUpdatedCategory(null);
    }
    if (updatedCategoryGroup) {
      updateCategoryGroup(updatedCategoryGroup);
      setUpdatedCategoryGroup(null);
    }

    setActive({ id: null, type: null });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const [active, setActive] = useState<{
    id: UniqueIdentifier | null;
    type: "group" | "category" | null;
  }>({ id: null, type: null });

  const [draftView, setDraftView] = useState(view.categoriesByGroup);
  const [updatedCategory, setUpdatedCategory] =
    useState<UpdatedCategory | null>(null);
  const [updatedCategoryGroup, setUpdatedCategoryGroup] =
    useState<UpdatedCategoryGroup | null>(null);

  const activeCategory = useMemo(() => {
    return draftView
      .flatMap((g) => g.rows)
      .find((r) => r.category.id === active.id);
  }, [active, draftView]);

  const isDraggingCategoryGroups = active.type === "group";

  //======
  // Delete dialog
  //======
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteCategoryGroup] = useDeleteCategoryGroupMutation();

  // Called when user confirms delete
  const handleDelete = (args: DeleteArgs) => {
    if (args.type === "category") {
      deleteCategory(args);
    }

    if (args.type === "categoryGroup") {
      deleteCategoryGroup(args);
    }
  };

  const deleteDialog = useDeleteDialog({
    onDelete: handleDelete,
    getSelectOptions: getCategorySelectOptions,
  });

  const handleDeleteTemp = (target: ContextTarget) => {
    if (target.type === "category") {
      handleDeleteCategory(target);
    }

    if (target.type === "categoryGroup") {
      handleDeleteCategoryGroup(target);
    }
  };

  // Called when user starts delete flow from category context menu
  const handleDeleteCategory = (target: DeleteCategoryTarget) => {
    const state = getCategoryDeleteState(target.id);

    if (state.canDelete) {
      deleteCategory({ categoryId: target.id });
      return;
    }

    deleteDialog.openDialog({
      type: "category",
      categoryId: state.categoryId,
      name: target.name,
      hasAssigned: state.hasAssigned,
      transactionCount: state.transactionCount,
    });
  };

  // Called when user starts delete flow from group context menu
  const handleDeleteCategoryGroup = (target: DeleteCategoryGroupTarget) => {
    const state = getCategoryGroupDeleteState(target.id);

    if (state.canDelete) {
      deleteCategoryGroup({ categoryGroupId: target.id });
      return;
    }

    deleteDialog.openDialog({
      type: "categoryGroup",
      categoryGroupId: state.categoryGroupId,
      name: target.name,
      hasAssigned: state.hasAssigned,
      transactionCount: state.transactionCount,
      categoryCount: state.categoryCount,
    });
  };

  const [contextMenuTarget, setContextMenuTarget] =
    useState<ContextTarget | null>(null);

  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const handleContextMenu = (e: React.MouseEvent, target: ContextTarget) => {
    e.preventDefault();

    setContextMenuTarget(target);

    setContextMenuPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleRename = (target: ContextTarget, name: string) => {
    if (target.type === "category") {
      updateCategory({ categoryId: target.id, name: name });
    }
    if (target.type === "categoryGroup") {
      updateCategoryGroup({ categoryGroupId: target.id, name: name });
    }
  };

  return (
    <div className="bg-stone-100">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => {
          setActive({
            id: event.active.id,
            type: event.active.data.current?.type ?? null,
          });
        }}
        onDragOver={(event: DragOverEvent) => {
          const { active, over } = event;
          const activeId = active.id;

          if (!over) return;
          const overId = over.id;

          if (active.data.current?.type === "group") {
            const { view, updatedGroup } = moveGroups(
              draftView,
              activeId,
              overId
            );
            setDraftView(view);
            setUpdatedCategoryGroup(updatedGroup);
            return;
          }

          const { view, updatedCategory } = moveItem(
            draftView,
            activeId,
            overId
          );
          setDraftView(view);
          setUpdatedCategory(updatedCategory);
        }}
        onDragEnd={() => handleDragEnd()}
        onDragCancel={() => {
          setDraftView(view.categoriesByGroup);
          setActive({ id: null, type: null });
        }}
      >
        <div className="bg-white">
          <AddCategoryGroupPopover>
            <AddCategoryGroupButton />
          </AddCategoryGroupPopover>
        </div>
        <CategoryGridRow className="bg-white">
          <CategoryTableHeader
            showExpandButton={expandCategoryGroups.displayGlobalExpand}
            open={expandCategoryGroups.atLeastOneGroupOpen}
            onClick={expandCategoryGroups.expandAllCategoryGroups}
            onSelectAllCategories={categorySelector.selectAll}
            getAllSelectionState={categorySelector.getAllSelectionState}
          />
        </CategoryGridRow>

        {/* // TODO:(lewis 2026-05-11 18:36) make this more semantic */}
        {uncategorisedRow.month.available !== 0 &&
          !isDraggingCategoryGroups && (
            <CategoryGridRow>
              <UncategorisedRow
                currency={currency}
                category={uncategorisedRow.category}
                month={uncategorisedRow.month}
                categorySelector={categorySelector}
              />
            </CategoryGridRow>
          )}
        <DragOverlay>
          {activeCategory ? (
            <CategoryRow
              category={activeCategory.category}
              month={activeCategory.month}
              categorySelection={categorySelector}
            />
          ) : null}
        </DragOverlay>

        {/* category group rows */}
        <SortableContext
          items={draftView.map((g) => g.group.id)}
          strategy={verticalListSortingStrategy}
        >
          {draftView.map(({ group, rows, open }) => {
            return (
              <div key={group.id}>
                <div className="group">
                  <CategoryGridRow
                    aria-label={`${group.name} category group`}
                    id={group.id}
                    className="bg-stone-200"
                  >
                    <CategoryGroupRow
                      onContextMenu={(e) =>
                        handleContextMenu(e, {
                          type: "categoryGroup",
                          id: group.id,
                          name: group.name,
                        })
                      }
                      open={open}
                      categoryGroup={group}
                      currency={currency}
                      onExpandClick={() => {
                        expandCategoryGroups.expandCategoryGroup(group.id);
                      }}
                      selectionState={categorySelector.getCategoryGroupSelectionState(
                        group.id
                      )}
                      onGroupClick={categorySelector.onCategoryGroupClick}
                    />
                  </CategoryGridRow>
                </div>
                {open && !isDraggingCategoryGroups && (
                  <SortableContext
                    items={rows.map((r) => r.category.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {/* category rows */}
                    {rows.map((row) => {
                      return (
                        <CategoryRow
                          onContextMenu={(e) =>
                            handleContextMenu(e, {
                              type: "category",
                              id: row.category.id,
                              name: row.category.name,
                              categoryGroupId: row.category.categoryGroupId,
                            })
                          }
                          key={row.category.id}
                          category={row.category}
                          month={row.month}
                          // TODO:(lewis 2026-05-15 15:05) this should be categorySelector
                          categorySelection={categorySelector}
                        />
                      );
                    })}
                  </SortableContext>
                )}
                <CategoryGroupDropZone
                  groupId={group.id}
                  active={!!active.id}
                  enabled={rows.length === 0 || !open}
                />
              </div>
            );
          })}
        </SortableContext>
      </DndContext>
      <DeleteDialog
        open={deleteDialog.open}
        state={deleteDialog.state}
        selectOptions={deleteDialog.selectOptions}
        accept={deleteDialog.accept}
        cancel={deleteDialog.cancel}
      />
      <ContextMenu
        open={!!contextMenuTarget}
        item={contextMenuTarget}
        position={contextMenuPosition}
        canRename={canRename}
        onRename={handleRename}
        onDelete={handleDeleteTemp}
        onClose={() => setContextMenuTarget(null)}
      />
    </div>
  );
}

type MoveResult = {
  view: MappedCategoryGroupViewWithMetrics[];
  updatedCategory: UpdatedCategory;
};

type UpdatedCategory = {
  categoryId: CategoryId;
  categoryGroupId: CategoryGroupId;
  position: number;
};

type UpdatedCategoryGroup = {
  categoryGroupId: CategoryGroupId;
  position: number;
};

function moveItem(
  view: MappedCategoryGroupViewWithMetrics[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier
): MoveResult {
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

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/core/lib/utils";
import {
  useDeleteCategoryGroupMutation,
  useUpdateCategoryGroupMutation,
} from "@/core/api/budget/categoryGroup/CategoryGroupApiSlice";
import { CategoryGroupDeleteState } from "../../utils/getCategoryGroupDeleteState";
import {
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/core/api/budget/category/categoryApiSlice";
import { CategoryDeleteState } from "../../utils/getCategoryDeleteState";
import {
  CategorySelectOptions,
  ExcludeTarget,
  ContextTarget,
} from "../../hooks/useAllocation/useAllocation";
import { ContextMenu } from "../../contextMenus/ContextMenu";
import { DeleteDialog } from "../../dialogs/deleteCategoryDialog/DeleteDialog";
import {
  DeleteArgs,
  useDeleteDialog,
} from "../../dialogs/deleteCategoryDialog/useDeleteDialog";

type Props = {
  groupId: string;
  active: boolean;
  enabled: boolean;
};

export function CategoryGroupDropZone({ groupId, active, enabled }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: groupId,
  });
  //active = something actively being dragged
  // over = something is over the dropzone

  return (
    <div
      ref={setNodeRef}
      className={cn(
        active ? "h-0" : "h-0",
        isOver && enabled && "h-10 bg-stone-100"
      )}
    />
  );
}

type MoveGroupsResult = {
  view: MappedCategoryGroupViewWithMetrics[];
  updatedGroup: {
    categoryGroupId: CategoryGroupId;
    position: number;
  };
};

function moveGroups(
  view: MappedCategoryGroupViewWithMetrics[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier
): MoveGroupsResult {
  const next = structuredClone(view);

  const fromIndex = next.findIndex((g) => g.group.id === activeId);
  const toIndex = next.findIndex((g) => g.group.id === overId);

  if (fromIndex === -1 || toIndex === -1) return view;

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
