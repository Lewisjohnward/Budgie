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

export function Categories({
  currency,
  view,
  expandCategoryGroups,
  categorySelector,
}: any) {
  const { uncategorisedRow, categoriesByGroup } = view;

  return (
    <>
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
            month={uncategorisedRow.month}
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

            {open &&
              rows.map((row) => (
                <CategoryRow
                  key={row.category.id}
                  category={row.category}
                  month={row.month}
                  categorySelection={categorySelector}
                />
              ))}
          </div>
        );
      })}
    </>
  );
}
