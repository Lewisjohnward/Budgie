import { MappedAllocationData } from "@/core/types/Allocation";

export function useUncategorisedCategory(
  allocationData: MappedAllocationData,
  monthIndex: number,
) {
  const { categoryGroups, categories, months } = allocationData;

  const uncategorisedGroupId = Object.keys(categoryGroups).find(
    (key) => categoryGroups[key].name === "Uncategorised",
  )!;

  const uncategorisedCategoryId =
    categoryGroups[uncategorisedGroupId].categories[0];
  const uncategorisedMonthIds = categories[uncategorisedCategoryId].months;
  const uncategorisedMonth = months[uncategorisedMonthIds[monthIndex]];

  const display = uncategorisedMonth.activity != 0;

  return { display, id: uncategorisedGroupId, month: uncategorisedMonth };
}
