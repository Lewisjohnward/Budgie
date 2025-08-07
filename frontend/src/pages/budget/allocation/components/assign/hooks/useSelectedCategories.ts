import { useAppSelector } from "@/core/hooks/reduxHooks";
import { useState } from "react";
import { selectSelectedCategories } from "../../../slices/selectedCategorySlice";
import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { month } from "../../../slices/monthSlice";
import { calculateTotals } from "../../../utils/calculateTotals";
import { RTA_CATEGORY } from "../../../constants/categories";

export function useSelectedCategories() {
  const { data, isLoading } = useGetCategoriesQuery();
  const monthState = useAppSelector(month);
  const selectedCategoryState = useAppSelector(selectSelectedCategories);

  const [open, setOpen] = useState(true);
  const toggleOpen = () => {
    setOpen(!open);
  };

  // TODO: REMOVE THIS, ALWAYS LOADS
  if (isLoading || !data) {
    return {
      selectedCategories: [],
      categoryTotals: {
        available: 0,
        leftover: 0,
        assigned: 0,
        spending: 0,
        futureCredit: 0,
      },
      monthTotals: { leftover: 0, assigned: 0, spending: 0, available: 0 },
      allCategories: [],
      currentMonthName: "shake and bake",
      open,
      toggleOpen,
      isLoading,
    };
  }

  const months = data.months;

  const selectedCategories = selectedCategoryState.selected;
  const currentMonthIndex = monthState.monthIndex;

  const categoryTotalsResult = calculateTotals(
    selectedCategories,
    months,
    currentMonthIndex
  );

  const categoryTotals = { ...categoryTotalsResult, futureCredit: 0 };

  const allCategories = Object.values(data.categories);

  // remove protected categories from all categories
  const allCategoriesWithoutRTA = allCategories.filter(
    (c) => c.name !== RTA_CATEGORY
  );

  const monthTotalsResult = calculateTotals(
    allCategoriesWithoutRTA,
    months,
    currentMonthIndex
  );

  const monthTotals = {
    leftover: monthTotalsResult.leftover,
    assigned: monthTotalsResult.assigned,
    spending: monthTotalsResult.spending,
    available: monthTotalsResult.available,
  };

  const getMonthName = () => {
    const representativeCategory = allCategories.find(
      (c) => c.months && c.months.length > currentMonthIndex
    );

    if (representativeCategory) {
      const monthId = representativeCategory.months[currentMonthIndex];
      if (monthId) {
        const monthData = months[monthId];
        if (monthData) {
          const date = new Date(monthData.month);
          return date.toLocaleString("default", { month: "long" });
        }
      }
    }
    return "Unknown";
  };

  const currentMonthName = getMonthName();

  return {
    selectedCategories,
    categoryTotals,
    monthTotals,
    currentMonthName,
    open,
    toggleOpen,
  };
}

export type SelectedCategoriesState = ReturnType<typeof useSelectedCategories>;
export type CategoryTotals = SelectedCategoriesState["categoryTotals"];
export type MonthTotals = SelectedCategoriesState["monthTotals"];
