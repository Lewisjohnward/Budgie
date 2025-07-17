import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { toMonthKey } from "../utils/dateUtils";
import { useMonthSelector } from "./useMonthSelector";
import { useMappedAllocationData } from "./useMappedAllocationData";
import { useExpandableCategoryGroups } from "./useExpandableCategoryGroups";
import { useInflowCategory } from "./useInflowCategory";

export function useAllocation() {
  const { data } = useGetCategoriesQuery();

  const { allocationData, setAllocationData } = useMappedAllocationData(data);

  const uniqueMonths = new Set(
    Object.values(allocationData.months).map(({ month }) => toMonthKey(month)),
  );

  const month = useMonthSelector([...uniqueMonths]);

  const { categories, months } = allocationData;

  const { inflowGroupId, assignId, assignableAmount } = useInflowCategory(
    allocationData,
    month.index,
  );

  const derivedGroups = Object.values(
    Object.fromEntries(
      Object.entries(allocationData.categoryGroups).filter(
        ([key]) => key !== inflowGroupId,
      ),
    ),
  );

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
    assignId,
  };
}
