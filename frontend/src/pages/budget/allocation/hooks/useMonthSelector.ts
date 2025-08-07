import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { month, selectMonthIndex } from "../slices/monthSlice";
import { formatDate } from "../utils/dateUtils";
import { useEffect } from "react";

export function useMonthSelector(months: string[]) {
  const dispatch = useAppDispatch();
  const { monthIndex } = useAppSelector(month);
  const formattedMonths = months.map((month) => formatDate(month));

  const now = new Date();

  const currentMonth = `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1
  ).padStart(2, "0")}`;
  const currentMonthIndex = months.indexOf(currentMonth);

  const selectCurrentMonth = () => {
    dispatch(selectMonthIndex(currentMonthIndex));
  };

  const next = () =>
    dispatch(
      selectMonthIndex(
        monthIndex + 1 < months.length ? monthIndex + 1 : monthIndex
      )
    );
  const prev = () =>
    dispatch(
      selectMonthIndex(monthIndex - 1 >= 0 ? monthIndex - 1 : monthIndex)
    );

  useEffect(() => {
    selectCurrentMonth();
  }, []);

  const current = formattedMonths[monthIndex] ?? "";

  const canGoNext = monthIndex < months.length - 1;
  const canGoPrev = monthIndex > 0;
  const isCurrentMonth = currentMonthIndex === monthIndex;

  return {
    monthIndex,
    isCurrentMonth,
    current,
    next,
    prev,
    selectCurrentMonth,
    canGoNext,
    canGoPrev,
  };
}

export type MonthSelectorType = ReturnType<typeof useMonthSelector>;
