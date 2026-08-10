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
import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CategoryGroupId, CategoryId } from "../../types/types";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { ContextMenu } from "../../contextMenus/ContextMenu";
import { DeleteDialog } from "../../dialogs/deleteCategoryDialog/DeleteDialog";
import { CategoryGroupDropZone } from "./components/CategoryGroupDropZone";
import { useContextMenu } from "./hooks/useContextMenu";
import { useCategoryActions } from "./hooks/useActions";
import {
  ExcludeTarget,
  CategorySelectOptions,
  CategoryActionTarget,
} from "../../hooks/useAllocation/useAllocation";
import { CategoryDeleteState } from "../../utils/getCategoryDeleteState";
import { CategoryGroupDeleteState } from "../../utils/getCategoryGroupDeleteState";

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
    canRename: (target: CategoryActionTarget, name: string) => boolean;
  };
};

export type DeleteCategoryArgs = {
  categoryId: CategoryId;
  inheritingCategoryId?: CategoryId;
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

  const categoryActions = useCategoryActions({
    getCategoryDeleteState,
    getCategoryGroupDeleteState,
    getCategorySelectOptions,
  });

  const contextMenu = useContextMenu();

  const dragAndDrop = useDragAndDrop({ categoriesByGroup });

  return (
    <div className="bg-stone-100">
      <DndContext
        sensors={dragAndDrop.sensors}
        collisionDetection={closestCenter}
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
        {uncategorisedRow.month.available !== 0 &&
          !dragAndDrop.isDraggingCategoryGroup && (
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
          {dragAndDrop.activeCategory ? (
            <CategoryRow
              category={dragAndDrop.activeCategory.category}
              month={dragAndDrop.activeCategory.month}
              categorySelection={categorySelector}
            />
          ) : null}
        </DragOverlay>

        {/* category group rows */}
        <SortableContext
          items={dragAndDrop.draftView.map((g) => g.group.id)}
          strategy={verticalListSortingStrategy}
        >
          {dragAndDrop.draftView.map(({ group, rows, open }) => {
            return (
              <div key={group.id}>
                <div className="group">
                  <CategoryGridRow
                    aria-label={`${group.name} category group`}
                    id={group.id}
                    className="bg-stone-200"
                    onContextMenu={(e) =>
                      contextMenu.open(e, {
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
                </div>
                {open && !dragAndDrop.isDraggingCategoryGroup && (
                  <SortableContext
                    items={rows.map((r) => r.category.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {/* category rows */}
                    {rows.map((row) => {
                      return (
                        <CategoryRow
                          onContextMenu={(e) =>
                            contextMenu.open(e, {
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
                  active={dragAndDrop.isDragging}
                  enabled={rows.length === 0 || !open}
                />
              </div>
            );
          })}
        </SortableContext>
      </DndContext>
      <DeleteDialog
        open={categoryActions.deleteDialog.open}
        state={categoryActions.deleteDialog.state}
        selectOptions={categoryActions.deleteDialog.selectOptions}
        accept={categoryActions.deleteDialog.accept}
        cancel={categoryActions.deleteDialog.cancel}
      />
      <ContextMenu
        open={!!contextMenu.target}
        target={contextMenu.target}
        position={contextMenu.position}
        canRename={canRename}
        onRename={categoryActions.renameTarget}
        onDelete={categoryActions.handleRequestDelete}
        onClose={contextMenu.close}
      />
    </div>
  );
}
