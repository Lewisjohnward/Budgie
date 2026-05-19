import { AddCategoryGroupPopover } from "../../popovers/AddCategoryGroupPopover";
import { CategoryGroupContextMenu } from "../../contextMenus/CategoryGroupContextMenu";
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
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useEditCategoryMutation } from "@/core/api/budget/category/categoryApiSlice";
import { CategoryId, CategoryGroupId } from "../../types/types";

type CategoriesProps = {
  currency: string;
  view: {
    uncategorisedRow: CategoryViewRow;
    categoriesByGroup: MappedCategoryGroupViewWithMetrics[];
  };
  expandCategoryGroups: ExpandableCategoryGroupsState;
  categorySelector: CategorySelectionState;
};

export function Categories({
  currency,
  view,
  expandCategoryGroups,
  categorySelector,
}: CategoriesProps) {
  const { uncategorisedRow, categoriesByGroup } = view;
  const [editCategory] = useEditCategoryMutation();
  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return;

    const categoryId = active.id;
    const overId = over.id;

    const categoryIdToGroup = new Map<CategoryId, CategoryGroupId>();

    categoriesByGroup.forEach(({ group, rows }) => {
      rows.forEach((row) => {
        categoryIdToGroup.set(row.category.id, group.id);
      });
    });

    const fromGroupId = categoryIdToGroup.get(categoryId);
    if (!fromGroupId) return;

    const overGroupId = categoryIdToGroup.get(overId);

    // -----------------------------
    // CASE 1: dropping on another category
    // -----------------------------
    if (overGroupId) {
      console.log("dropping on another category");
      const targetGroup = categoriesByGroup.find(
        (g) => g.group.id === overGroupId
      );

      if (!targetGroup) return;

      const overIndex = targetGroup.rows.findIndex(
        (r) => r.category.id === overId
      );

      const newIndex = overIndex === -1 ? targetGroup.rows.length : overIndex;

      console.log(categoryId, overGroupId, newIndex);

      editCategory({
        categoryId,
        categoryGroupId: overGroupId,
        position: newIndex,
      });

      return;
    }

    // -----------------------------
    // CASE 2: dropping on group container
    // -----------------------------
    const targetGroup = categoriesByGroup.find((g) => g.group.id === overId);
    console.log("dropping on group container");

    if (targetGroup) {
      editCategory({
        categoryId,
        categoryGroupId: overId,
        position: targetGroup.rows.length,
      });

      return;
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <AddCategoryGroupPopover>
          <AddCategoryGroupButton />
        </AddCategoryGroupPopover>
        <CategoryGridRow>
          <CategoryTableHeader
            showExpandButton={expandCategoryGroups.displayGlobalExpand}
            open={expandCategoryGroups.atLeastOneGroupOpen}
            onClick={expandCategoryGroups.expandAllCategoryGroups}
            onSelectAllCategories={categorySelector.selectAll}
            getAllSelectionState={categorySelector.getAllSelectionState}
          />
        </CategoryGridRow>

        {/* // TODO:(lewis 2026-05-11 18:36) make this more semantic */}
        {uncategorisedRow.month.available !== 0 && (
          <CategoryGridRow>
            <UncategorisedRow
              currency={currency}
              category={uncategorisedRow.category}
              month={uncategorisedRow.month}
              categorySelector={categorySelector}
            />
          </CategoryGridRow>
        )}

        {categoriesByGroup.map(({ group, rows, open }) => {
          return (
            <div key={group.id}>
              <CategoryGroupContextMenu categoryGroup={group}>
                <div className="group bg-gray-400/20">
                  <CategoryGridRow>
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
              </CategoryGroupContextMenu>

              {open && (
                <SortableContext
                  items={rows.map((r) => r.category.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {rows.map((row) => (
                    <CategoryRow
                      key={row.category.id}
                      category={row.category}
                      month={row.month}
                      // TODO:(lewis 2026-05-15 15:05) this should be categorySelector
                      categorySelection={categorySelector}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          );
        })}
      </DndContext>
    </>
  );
}
