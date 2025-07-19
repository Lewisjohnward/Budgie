import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { toMonthKey } from "../utils/dateUtils";
import { useMonthSelector } from "./useMonthSelector";
import { useMappedAllocationData } from "./useMappedAllocationData";
import { useExpandableCategoryGroups } from "./useExpandableCategoryGroups";
import { useInflowCategory } from "./useInflowCategory";
import { MappedCategoryGroup } from "@/core/types/Allocation";
import { useUncategorisedCategory } from "./useUncategorisedCategory";

export function useAllocation() {
  const { data } = useGetCategoriesQuery();

  const { allocationData, setAllocationData } = useMappedAllocationData(data);

  const uniqueMonths = new Set(
    Object.values(allocationData.months).map(({ month }) => toMonthKey(month)),
  );

  const month = useMonthSelector([...uniqueMonths]);

  const { categories, months } = allocationData;

  const { inflowGroupId, assignableAmount } = useInflowCategory(
    allocationData,
    month.index,
  );

  const uncategorisedGroup = useUncategorisedCategory(
    allocationData,
    month.index,
  );

  const derivedGroups: MappedCategoryGroup[] = Object.entries(
    allocationData.categoryGroups,
  )
    .filter(([key]) => key !== inflowGroupId && key !== uncategorisedGroup.id)
    .map(([, group]) => {
      const assigned = group.categories.reduce((sum, categoryId) => {
        const category = allocationData.categories[categoryId];
        const m = allocationData.months[category.months[month.index]];
        return sum + m.assigned;
      }, 0);

      const activity = group.categories.reduce((sum, categoryId) => {
        const category = allocationData.categories[categoryId];
        const m = allocationData.months[category.months[month.index]];
        return sum + m.activity;
      }, 0);

      const available = assigned + activity;

      return {
        ...group,
        assigned: assigned.toFixed(2),
        activity: activity.toFixed(2),
        available: available.toFixed(2),
      };
    });

  const expandCategoryGroups = useExpandableCategoryGroups(
    derivedGroups,
    setAllocationData,
  );

  const categoriesSelector = [
    "All",
    "Underfunded",
    "Money available",
    "Snoozed",
  ];

  return {
    month,
    categoriesSelector,
    categoryGroups: derivedGroups,
    categories,
    expandCategoryGroups,
    months,
    assignableAmount,
    uncategorisedGroup,
  };
}
