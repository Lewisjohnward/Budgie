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
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CategoryId } from "../../types/types";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { CategoryActionTarget } from "../../hooks/useAllocation/useAllocation";
import { CategorySystemBranded } from "@/core/types/NormalizedData";
import { useMemo, useRef } from "react";
import { createCollisionDetectionStrategy } from "./utils/dnd/createCollisionDetectionStrategy";
import { preserveGrabPoint } from "./utils/dnd/preserveGrabPoint";

type CategoriesProps = {
  currency: string;
  view: {
    uncategorisedRow: CategoryViewRow<CategorySystemBranded>;
    categoriesByGroup: MappedCategoryGroupViewWithMetrics[];
  };
  expandCategoryGroups: ExpandableCategoryGroupsState;
  categorySelector: CategorySelectionState;
  onContextMenu: (e: React.MouseEvent, target: CategoryActionTarget) => void;
};

export type DeleteCategoryArgs = {
  categoryId: CategoryId;
  inheritingCategoryId?: CategoryId;
};

export function Categories({
  currency,
  view,
  expandCategoryGroups,
  categorySelector,
  onContextMenu,
}: CategoriesProps) {
  const { uncategorisedRow, categoriesByGroup } = view;

  const dragAndDrop = useDragAndDrop({ categoriesByGroup });
  const dndContainerRef = useRef<HTMLDivElement>(null);

  const collisionDetectionStrategy = useMemo(
    () => createCollisionDetectionStrategy(dndContainerRef),
    []
  );

  return (
    <div ref={dndContainerRef} className="flex w-full h-full min-h-0 flex-col">
      <DndContext
        sensors={dragAndDrop.sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={dragAndDrop.onDragStart}
        onDragOver={dragAndDrop.onDragOver}
        onDragEnd={dragAndDrop.onDragEnd}
        onDragCancel={dragAndDrop.onDragCancel}
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
        <div className="flex-1 min-h-0 overflow-y-auto">
          {uncategorisedRow.month.available !== 0 && (
            <CategoryGridRow
              className="py-3 cursor-default"
              isSelected={categorySelector.isSelected(
                uncategorisedRow.category.id
              )}
              onClick={(e: React.MouseEvent) =>
                categorySelector.onRowClick(e, uncategorisedRow.category)
              }
            >
              <UncategorisedRow
                currency={currency}
                category={uncategorisedRow.category}
                month={uncategorisedRow.month}
                categorySelector={categorySelector}
              />
            </CategoryGridRow>
          )}
          <DragOverlay
            modifiers={
              dragAndDrop.isDraggingCategoryGroup
                ? [preserveGrabPoint]
                : undefined
            }
          >
            {dragAndDrop.activeCategory ? (
              <CategoryRow
                className="scale-90 opacity-30"
                category={dragAndDrop.activeCategory.category}
                month={dragAndDrop.activeCategory.month}
                categorySelection={categorySelector}
              />
            ) : dragAndDrop.activeCategoryGroup ? (
              <CategoryGridRow className="scale-90 opacity-30 bg-stone-200">
                <CategoryGroupRow
                  open={dragAndDrop.activeCategoryGroup.open}
                  categoryGroup={dragAndDrop.activeCategoryGroup.group}
                  currency={currency}
                  onExpandClick={() => { }}
                  selectionState={categorySelector.getCategoryGroupSelectionState(
                    dragAndDrop.activeCategoryGroup.group.id
                  )}
                  onGroupClick={categorySelector.onCategoryGroupClick}
                />
              </CategoryGridRow>
            ) : null}
          </DragOverlay>

          {/* category group rows */}
          <SortableContext
            items={dragAndDrop.displayView.map((g) => g.group.id)}
            strategy={verticalListSortingStrategy}
          >
            {dragAndDrop.displayView.map(({ group, rows, open }) => {
              const showCategoryGroupDropZone =
                dragAndDrop.isCategoryOverEmptyOrClosedGroup(group.id);

              return (
                <div
                  key={group.id}
                  role="rowgroup"
                  aria-label={`${group.name} category group`}
                >
                  <div className="group">
                    <CategoryGridRow
                      aria-label={`${group.name} category group`}
                      id={group.id}
                      className="bg-stone-200"
                      onContextMenu={(e) =>
                        onContextMenu(e, {
                          type: "categoryGroup",
                          id: group.id,
                          name: group.name,
                        })
                      }
                    >
                      <CategoryGroupRow
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

                    {showCategoryGroupDropZone && (
                      <div className="h-10 bg-stone-100" />
                    )}
                  </div>

                  {!dragAndDrop.isDraggingCategoryGroup && open && (
                    <SortableContext
                      items={rows.map((r) => r.category.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {/* category rows */}
                      {rows.map((row) => {
                        return (
                          <CategoryRow
                            onContextMenu={(e) =>
                              onContextMenu(e, {
                                type: "category",
                                id: row.category.id,
                                name: row.category.name,
                                categoryGroupId: row.category.categoryGroupId,
                              })
                            }
                            key={row.category.id}
                            category={row.category}
                            isOverEmptyOrClosedGroup={
                              dragAndDrop.isDraggingCategoryOverEmptyOrClosedGroup
                            }
                            month={row.month}
                            // TODO:(lewis 2026-05-15 15:05) this should be categorySelector
                            categorySelection={categorySelector}
                          />
                        );
                      })}
                    </SortableContext>
                  )}
                </div>
              );
            })}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
