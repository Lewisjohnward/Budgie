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
import { CategoryState } from "../../hooks/useAllocation/useAllocation";

export function Categories({
  currency,
  categoryData,
  expandCategoryGroups,
  monthIndex,
}: CategoryState) {
  const { categoryGroups, uncategorisedGroup, categories, months } =
    categoryData;

  return (
    <>
      <AddCategoryGroupPopover>
        <AddCategoryGroupButton />
      </AddCategoryGroupPopover>
      <CategoryGridRow>
        <CategoryTableHeader
          showExpandButton={categoryGroups.length > 0}
          open={expandCategoryGroups.atLeastOneGroupOpen}
          onClick={expandCategoryGroups.expandAllCategoryGroups}
        />
      </CategoryGridRow>

      <CategoryGridRow>
        <UncategorisedRow
          currency={currency}
          activity={uncategorisedGroup.month.activity}
          available={uncategorisedGroup.month.available}
        />
      </CategoryGridRow>

      {categoryGroups.map((categoryGroup) => (
        <div key={categoryGroup.id}>
          <CategoryGroupContextMenu categoryGroup={categoryGroup}>
            <div className="group bg-gray-400/20">
              <CategoryGridRow>
                <CategoryGroupRow
                  categoryGroup={categoryGroup}
                  currency={currency}
                  onExpandClick={() =>
                    expandCategoryGroups.expandCategoryGroup(categoryGroup.id)
                  }
                />
              </CategoryGridRow>
            </div>
          </CategoryGroupContextMenu>

          {categoryGroup.open &&
            categoryGroup.categories.map((cat) => {
              const category = categories[cat];
              const month = months[category.months[monthIndex]];

              return (
                <CategoryRow key={month.id} category={category} month={month} />
              );
            })}
        </div>
      ))}
    </>
  );
}
