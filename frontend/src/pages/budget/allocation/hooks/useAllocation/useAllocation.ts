import { useMonthSelector } from "../useMonthSelector";
import { useExpandableCategoryGroups } from "./useExpandableCategoryGroups";
import { clearCategories } from "../../slices/selectedCategorySlice";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { useEffect } from "react";
import { useAssign } from "../../components/assign/hooks/useAssign";
import { useCategories } from "./useCategories";

export function useAllocation() {
  const dispatch = useAppDispatch();
  const {
    protectedCategoryGroups,
    months,
    categories,
    categoryGroups,
    rtaAvailable,
    uniqueMonthsKeys,
    uncategorisedGroup,
  } = useCategories();

  const monthSelector = useMonthSelector([...uniqueMonthsKeys]);

  const assignableAmount = rtaAvailable;

  // these can go in a custom hook
  const resetSelectedCategories = () => {
    dispatch(clearCategories());
  };
  useEffect(() => {
    resetSelectedCategories();
  }, []);
  ////

  const expandCategoryGroups = useExpandableCategoryGroups({
    categoryGroups,
    categories,
    months,
    monthIndex: monthSelector.monthIndex,
    protectedGroupIds: protectedCategoryGroups,
  });

  const categoriesSelector = [
    "All",
    "Underfunded",
    "Money available",
    "Snoozed",
  ];

  const assign = useAssign();

  const currency = "£";

  return {
    categoryState: {
      currency,
      monthIndex: monthSelector.monthIndex,
      categoryData: {
        categoryGroups: expandCategoryGroups.categoryGroups,
        months,
        categories,
        uncategorisedGroup,
      },
      expandCategoryGroups,
    },
    headerState: {
      currency,
      monthSelector,
      categoriesSelector,
      assignableAmount,
    },
    assignState: {
      currency,
      assign,
    },
  };
}

export type AllocationState = ReturnType<typeof useAllocation>;
export type HeaderState = AllocationState["headerState"];
export type CategoryState = AllocationState["categoryState"];
export type AssignState = AllocationState["assignState"];
