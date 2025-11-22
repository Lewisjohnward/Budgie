import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/core/hooks/reduxHooks";
import { useCategoriesData } from "../../allocation/hooks/useAllocation/useCategories";
import {
  RTA_CATEGORY,
  UNCATEGORISED_CATEGORY,
} from "../../allocation/constants/categories";
import {
  reflectMonth,
  initializeAllPages,
  incrementPageMonth,
  decrementPageMonth,
  setPageDateRange,
  setPageFilters,
} from "../slices/reflectMonthSlice";
import { REFLECT_PAGES, type ReflectPageKey } from "../constants/pages";
import type { DateRangeOption } from "../constants/dateRanges";

export type ViewMode = "categories" | "groups";

const colors = ["#93D53E", "#545BFE", "#AEE865", "#CE5E66", "#F6C91D"];

export const useSpendingData = (page: ReflectPageKey) => {
  const title = REFLECT_PAGES[page].title;
  const data = useCategoriesData();
  const reflectState = useAppSelector(reflectMonth);
  const { initialized } = reflectState;
  const pageFilters = reflectState.pages[page];
  const { monthIndex, startMonthIndex, endMonthIndex } = pageFilters;

  const months = Object.values(data.months);
  const categories = Object.values(data.categories);
  const uniqueMonths = [...new Set(months.map((m) => m.month))];
  const targetMonthDate = uniqueMonths[monthIndex];

  const uncategorisedCategoryId = categories.find(
    (c) => c.name === UNCATEGORISED_CATEGORY
  )?.id;
  const rtaCategoryId = categories.find((c) => c.name === RTA_CATEGORY)?.id;

  const allUserMonthsWithoutProtected = months.filter(
    (m) =>
      m.categoryId !== uncategorisedCategoryId && m.categoryId !== rtaCategoryId
  );

  // Get the date range for filtering
  const startDate = pageFilters.startMonthDate || uniqueMonths[startMonthIndex];
  console.log("startDate:", startDate);
  const endDate = pageFilters.endMonthDate || uniqueMonths[endMonthIndex];
  console.log("endDate:", endDate);
  // Filter data based on the date range
  const currentMonthData = allUserMonthsWithoutProtected.filter((m) => {
    return m.month >= startDate && m.month <= endDate;
  });

  // Filter state
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const selectedDateRange = pageFilters.selectedDateRange;
  const dispatch = useAppDispatch();

  const handleSetDateRange = (dateRange: DateRangeOption | null) => {
    // TODO:(lewis 2025-11-25 00:07) this should never be called because it should never be null
    if (!dateRange) {
      dispatch(setPageDateRange({ page, dateRange }));
      return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    let newStartIndex = monthIndex;
    let newEndIndex = monthIndex;

    // Helper function to calculate a date X months before the current month
    const calculateDateXMonthsBack = (monthsBack: number): string => {
      const currentDate = new Date(uniqueMonths[monthIndex]);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Create a new date X months back, always on the 1st of the month
      const targetDate = new Date(year, month - monthsBack, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = String(targetDate.getMonth() + 1).padStart(2, "0");

      // Return YYYY-MM-01 format
      return `${targetYear}-${targetMonth}-01`;
    };

    // Helper function to find the index of a month X months before the current month
    const findMonthIndexXMonthsBack = (monthsBack: number): number => {
      const currentDate = new Date(uniqueMonths[monthIndex]);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Create a new date X months back
      const targetDate = new Date(year, month - monthsBack, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();

      // Find the closest month that matches
      const targetIndex = uniqueMonths.findIndex((dateString) => {
        const date = new Date(dateString);
        return (
          date.getFullYear() === targetYear && date.getMonth() === targetMonth
        );
      });

      return targetIndex >= 0 ? targetIndex : 0;
    };

    let calculatedStartDate: string | undefined;
    let calculatedEndDate: string | undefined;

    // TODO:(lewis 2025-11-25 00:08) can this be a switch statement?
    if (dateRange === "This month") {
      // For "This month", start and end are the same (current month)
      newStartIndex = monthIndex;
      newEndIndex = monthIndex;
      calculatedStartDate = uniqueMonths[monthIndex];
      calculatedEndDate = uniqueMonths[monthIndex];
    } else if (dateRange === "Last 3 Months") {
      newEndIndex = monthIndex;
      newStartIndex = findMonthIndexXMonthsBack(2);
      calculatedStartDate = calculateDateXMonthsBack(2);
      calculatedEndDate = uniqueMonths[monthIndex];
    } else if (dateRange === "Last 6 Months") {
      newEndIndex = monthIndex;
      newStartIndex = findMonthIndexXMonthsBack(5);
      calculatedStartDate = calculateDateXMonthsBack(5);
      calculatedEndDate = uniqueMonths[monthIndex];
    } else if (dateRange === "Last 12 Months") {
      newEndIndex = monthIndex;
      newStartIndex = findMonthIndexXMonthsBack(11);
      calculatedStartDate = calculateDateXMonthsBack(11);
      calculatedEndDate = uniqueMonths[monthIndex];
    } else if (dateRange === "Year To Date") {
      // Find the start of the current year
      newEndIndex = monthIndex;
      const startOfYearIndex = uniqueMonths.findIndex((dateString) => {
        const date = new Date(dateString);
        return date.getFullYear() === currentYear && date.getMonth() === 0;
      });
      newStartIndex = startOfYearIndex >= 0 ? startOfYearIndex : 0;

      // Calculate January of current year
      calculatedStartDate = `${currentYear}-01-01`;
      calculatedEndDate = uniqueMonths[monthIndex];
    } else if (dateRange === "Last Year") {
      // Find all months from the previous year
      const lastYear = currentYear - 1;
      const lastYearMonths = uniqueMonths
        .map((dateString, index) => ({ dateString, index }))
        .filter(({ dateString }) => {
          const date = new Date(dateString);
          return date.getFullYear() === lastYear;
        });

      if (lastYearMonths.length > 0) {
        newStartIndex = lastYearMonths[0].index;
        newEndIndex = lastYearMonths[lastYearMonths.length - 1].index;
      }

      // Calculate January and December of last year
      calculatedStartDate = `${lastYear}-01-01`;
      calculatedEndDate = `${lastYear}-12-01`;
    } else if (dateRange === "All Dates") {
      newStartIndex = 0;
      newEndIndex = uniqueMonths.length - 1;
      calculatedStartDate = uniqueMonths[0];
      calculatedEndDate = uniqueMonths[uniqueMonths.length - 1];
    }

    dispatch(
      setPageFilters({
        page,
        filters: {
          selectedDateRange: dateRange,
          startMonthIndex: newStartIndex,
          endMonthIndex: newEndIndex,
          startMonthDate: calculatedStartDate,
          endMonthDate: calculatedEndDate,
        },
      })
    );
  };

  const currentMonthDate = uniqueMonths[monthIndex];
  // Use calculated dates if available, otherwise fall back to index-based dates
  const startMonthDate =
    pageFilters.startMonthDate || uniqueMonths[startMonthIndex];
  const endMonthDate = pageFilters.endMonthDate || uniqueMonths[endMonthIndex];

  // Initialize all pages to current month on first load
  useEffect(() => {
    if (!initialized && uniqueMonths.length > 0) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed

      // Find the index of the current month
      const currentMonthIndex = uniqueMonths.findIndex((dateString) => {
        const date = new Date(dateString);
        return (
          date.getFullYear() === currentYear && date.getMonth() === currentMonth
        );
      });

      // If current month exists, use it; otherwise use the last month
      const indexToSet =
        currentMonthIndex >= 0 ? currentMonthIndex : uniqueMonths.length - 1;
      dispatch(initializeAllPages({ monthIndex: indexToSet }));
    }
  }, [initialized, uniqueMonths, dispatch]);

  const handlePrevPeriod = () => {
    if (monthIndex > 0) {
      const newMonthIndex = monthIndex - 1;

      // If we have a date range selected, recalculate the range for the new month
      if (selectedDateRange && selectedDateRange !== "This month") {
        // Temporarily set the month index to calculate the new range
        const tempMonthIndex = newMonthIndex;
        handleSetDateRangeForMonth(selectedDateRange, tempMonthIndex);
      } else {
        dispatch(decrementPageMonth({ page }));
      }
    }
  };

  const handleNextPeriod = () => {
    if (monthIndex < uniqueMonths.length - 1) {
      const newMonthIndex = monthIndex + 1;

      // If we have a date range selected, recalculate the range for the new month
      if (selectedDateRange && selectedDateRange !== "This month") {
        // Temporarily set the month index to calculate the new range
        const tempMonthIndex = newMonthIndex;
        handleSetDateRangeForMonth(selectedDateRange, tempMonthIndex);
      } else {
        dispatch(incrementPageMonth({ page }));
      }
    }
  };

  const handleSetDateRangeForMonth = (
    dateRange: DateRangeOption,
    targetMonthIndex: number
  ) => {
    let newStartIndex = targetMonthIndex;
    let newEndIndex = targetMonthIndex;
    let calculatedStartDate: string | undefined;
    let calculatedEndDate: string | undefined;

    // Helper to calculate date X months back from target month
    const calculateDateXMonthsBackFromTarget = (monthsBack: number): string => {
      const targetDate = new Date(uniqueMonths[targetMonthIndex]);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();

      // Create a new date X months back, always on the 1st of the month
      const resultDate = new Date(year, month - monthsBack, 1);
      const resultYear = resultDate.getFullYear();
      const resultMonth = String(resultDate.getMonth() + 1).padStart(2, "0");

      // Return YYYY-MM-01 format
      return `${resultYear}-${resultMonth}-01`;
    };

    // Helper to find index X months back from target month
    const findMonthIndexXMonthsBackFromTarget = (
      monthsBack: number
    ): number => {
      const targetDate = new Date(uniqueMonths[targetMonthIndex]);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();

      // Create a new date X months back
      const resultDate = new Date(year, month - monthsBack, 1);
      const resultYear = resultDate.getFullYear();
      const resultMonth = resultDate.getMonth();

      const targetIndex = uniqueMonths.findIndex((dateString) => {
        const date = new Date(dateString);
        return (
          date.getFullYear() === resultYear && date.getMonth() === resultMonth
        );
      });

      return targetIndex >= 0 ? targetIndex : 0;
    };

    if (dateRange === "This month") {
      newStartIndex = targetMonthIndex;
      newEndIndex = targetMonthIndex;
      calculatedStartDate = uniqueMonths[targetMonthIndex];
      calculatedEndDate = uniqueMonths[targetMonthIndex];
    } else if (dateRange === "Last 3 Months") {
      newEndIndex = targetMonthIndex;
      newStartIndex = findMonthIndexXMonthsBackFromTarget(1);
      calculatedStartDate = calculateDateXMonthsBackFromTarget(1);
      calculatedEndDate = uniqueMonths[targetMonthIndex];
    } else if (dateRange === "Last 6 Months") {
      newEndIndex = targetMonthIndex;
      newStartIndex = findMonthIndexXMonthsBackFromTarget(5);
      calculatedStartDate = calculateDateXMonthsBackFromTarget(5);
      calculatedEndDate = uniqueMonths[targetMonthIndex];
    } else if (dateRange === "Last 12 Months") {
      newEndIndex = targetMonthIndex;
      newStartIndex = findMonthIndexXMonthsBackFromTarget(11);
      calculatedStartDate = calculateDateXMonthsBackFromTarget(11);
      calculatedEndDate = uniqueMonths[targetMonthIndex];
    } else if (dateRange === "Year To Date") {
      newEndIndex = targetMonthIndex;
      const targetDate = new Date(uniqueMonths[targetMonthIndex]);
      const targetYear = targetDate.getFullYear();
      const startOfYearIndex = uniqueMonths.findIndex((dateString) => {
        const date = new Date(dateString);
        return date.getFullYear() === targetYear && date.getMonth() === 0;
      });
      newStartIndex = startOfYearIndex >= 0 ? startOfYearIndex : 0;

      calculatedStartDate = `${targetYear}-01-01`;
      calculatedEndDate = uniqueMonths[targetMonthIndex];
    } else if (dateRange === "Last Year") {
      const targetDate = new Date(uniqueMonths[targetMonthIndex]);
      const lastYear = targetDate.getFullYear() - 1;
      const lastYearMonths = uniqueMonths
        .map((dateString, index) => ({ dateString, index }))
        .filter(({ dateString }) => {
          const date = new Date(dateString);
          return date.getFullYear() === lastYear;
        });

      if (lastYearMonths.length > 0) {
        newStartIndex = lastYearMonths[0].index;
        newEndIndex = lastYearMonths[lastYearMonths.length - 1].index;
      }

      calculatedStartDate = `${lastYear}-01-01`;
      calculatedEndDate = `${lastYear}-12-01`;
    } else if (dateRange === "All Dates") {
      newStartIndex = 0;
      newEndIndex = uniqueMonths.length - 1;
      calculatedStartDate = uniqueMonths[0];
      calculatedEndDate = uniqueMonths[uniqueMonths.length - 1];
    }

    dispatch(
      setPageFilters({
        page,
        filters: {
          monthIndex: targetMonthIndex,
          selectedDateRange: dateRange,
          startMonthIndex: newStartIndex,
          endMonthIndex: newEndIndex,
          startMonthDate: calculatedStartDate,
          endMonthDate: calculatedEndDate,
        },
      })
    );
  };

  let spendingData;

  if (viewMode === "categories") {
    // Display by individual categories - aggregate across all months in the range
    const categoryTotals = new Map<string, { name: string; value: number }>();

    currentMonthData.forEach((monthData) => {
      const category = data.categories[monthData.categoryId];
      const categoryId = monthData.categoryId;
      const categoryName = category?.name || "Unknown";
      const activity = Math.abs(monthData.activity);

      if (categoryTotals.has(categoryId)) {
        categoryTotals.get(categoryId)!.value += activity;
      } else {
        categoryTotals.set(categoryId, { name: categoryName, value: activity });
      }
    });

    spendingData = Array.from(categoryTotals.values())
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }));
  } else {
    // Display by category groups - aggregate across all months in the range
    const groupTotals = new Map<string, { name: string; value: number }>();

    currentMonthData.forEach((monthData) => {
      const category = data.categories[monthData.categoryId];
      const groupId = category?.categoryGroupId;

      if (groupId) {
        const group = data.categoryGroups[groupId];
        const groupName = group?.name || "Unknown Group";
        const activity = Math.abs(monthData.activity);

        if (groupTotals.has(groupId)) {
          groupTotals.get(groupId)!.value += activity;
        } else {
          groupTotals.set(groupId, { name: groupName, value: activity });
        }
      }
    });

    spendingData = Array.from(groupTotals.values())
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }));
  }

  return {
    spendingData,
    viewModeState: {
      viewMode,
      setViewMode,
    },
    titleBarState: {
      title,
      monthState: {
        monthIndex,
        currentMonthDate,
        startMonthDate,
        endMonthDate,
        handleNextPeriod,
        handlePrevPeriod,
        selectedDateRange,
        setSelectedDateRange: handleSetDateRange,
      },
      categoryState: {},
      accountState: {},
    },
  };
};

export type SpendingState = ReturnType<typeof useSpendingData>;
export type TitleBarState = SpendingState["titleBarState"];
export type ViewModeState = SpendingState["viewModeState"];
