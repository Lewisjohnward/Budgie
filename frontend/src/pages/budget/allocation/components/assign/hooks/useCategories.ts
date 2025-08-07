import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { useAppSelector } from "@/core/hooks/reduxHooks";
import { month } from "../../../slices/monthSlice";
import { AllocationData } from "@/core/types/Allocation";
import {
  RTA_CATEGORY,
  UNCATEGORISED_CATEGORY,
} from "../../../constants/categories";
import { selectSelectedCategories } from "../../../slices/selectedCategorySlice";

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
  const targetMonthDate = uniqueMonths[monthIndex];
  const previousMonthDate = uniqueMonths[monthIndex - 1];

  const uncategorisedCategoryId = categories.find(
    (c) => c.name === UNCATEGORISED_CATEGORY
  )?.id;
  const rtaCategoryId = categories.find((c) => c.name === RTA_CATEGORY)?.id;
  const rtaAvailable =
    months.find(
      (m) => m.month === targetMonthDate && m.categoryId === rtaCategoryId
    )?.available ?? 0;

  const selectedCategoryIds = new Set(selectedCategories.map((c) => c.id));

  const allUserMonths = months.filter(
    (m) =>
      m.categoryId !== uncategorisedCategoryId &&
      m.categoryId !== rtaCategoryId &&
      (selectedCategories.length === 0 || selectedCategoryIds.has(m.categoryId))
  );

  const currentMonthMonths = allUserMonths.filter(
    (m) => m.month === targetMonthDate
  );

  const previousMonths = allUserMonths.filter(
    (m) => m.month === previousMonthDate
  );

  return {
    allMonths: allUserMonths,
    currentMonths: currentMonthMonths,
    previousMonths,
    categories: data.categories,
    categoryGroups: data.categoryGroups,
    rtaAvailable,
    selectedCategories,
    uniqueMonths,
  };
};
