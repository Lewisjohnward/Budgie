import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { useAppSelector } from "@/core/hooks/reduxHooks";
import { AllocationData } from "@/core/types/Allocation";
import {
  RTA_CATEGORY,
  RTA_CATEGORY_GROUP,
  UNCATEGORISED_CATEGORY,
  UNCATEGORISED_CATEGORY_GROUP,
} from "../../constants/categories";
import { selectSelectedCategories } from "../../slices/selectedCategorySlice";
import { month } from "../../slices/monthSlice";
import { toMonthKey } from "../../utils/dateUtils";

const useCategoriesData = () => {
  const { data } = useGetCategoriesQuery();
  if (!data) {
    return {
      categoryGroups: {},
      categories: {},
      months: {},
    } as AllocationData;
  }
  return data;
};

export const useCategories = () => {
  const data = useCategoriesData();
  const { monthIndex } = useAppSelector(month);
  const { selected: selectedCategories } = useAppSelector(
    selectSelectedCategories
  );
  const months = Object.values(data.months);
  const categories = Object.values(data.categories);
  const uniqueMonths = [...new Set(months.map((m) => m.month))];
  const uniqueMonthsKeys = [...new Set(months.map((m) => toMonthKey(m.month)))];
  const targetMonthDate = uniqueMonths[monthIndex];
  const previousMonthDate = uniqueMonths[monthIndex - 1];

  const uncategorisedCategoryId = categories.find(
    (c) => c.name === UNCATEGORISED_CATEGORY
  )?.id;
  const rtaCategoryId = categories.find((c) => c.name === RTA_CATEGORY)?.id;

  const selectedCategoryIds = new Set(selectedCategories.map((c) => c.id));

  const allUserMonthsWithoutProtected = months.filter(
    (m) =>
      m.categoryId !== uncategorisedCategoryId &&
      m.categoryId !== rtaCategoryId &&
      (selectedCategories.length === 0 || selectedCategoryIds.has(m.categoryId))
  );

  const currentMonthData = allUserMonthsWithoutProtected.filter(
    (m) => m.month === targetMonthDate
  );

  const previousMonthData = allUserMonthsWithoutProtected.filter(
    (m) => m.month === previousMonthDate
  );

  const uncategorisedCategoryGroupId = Object.values(data.categoryGroups).find(
    (g) => g.name === UNCATEGORISED_CATEGORY_GROUP
  )?.id;

  const rtaCategoryGroupId = Object.values(data.categoryGroups).find(
    (g) => g.name === RTA_CATEGORY_GROUP
  )?.id;

  const rtaAvailable =
    data.months[data.categories[rtaCategoryId!].months[monthIndex]]?.available;

  const uncategorisedCategoryMonth =
    data.months[data.categories[uncategorisedCategoryId!].months[monthIndex]];

  return {
    protectedCategoryGroups: {
      uncategorisedCategoryGroupId: uncategorisedCategoryGroupId!,
      rtaCategoryGroupId: rtaCategoryGroupId!,
    },
    months: data.months,
    allMonths: allUserMonthsWithoutProtected,
    currentMonths: currentMonthData,
    previousMonths: previousMonthData,
    categories: data.categories,
    categoryGroups: data.categoryGroups,
    rtaAvailable,
    selectedCategories,
    uniqueMonthsKeys,
    uncategorisedCategoryMonth,
    uncategorisedGroup: {
      id: uncategorisedCategoryGroupId,
      month: uncategorisedCategoryMonth,
    },
  };
};
