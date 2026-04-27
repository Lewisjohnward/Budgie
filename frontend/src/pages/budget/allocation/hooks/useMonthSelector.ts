import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { selectMonthIndex, useMonthIndex } from "../slices/monthSlice";
import { formatDate } from "../utils/dateUtils";
import { MonthKey } from "../types/types";
import { getMonthName } from "../utils/getMonthName";

export type MonthSelectorHook = {
  isCurrentMonth: boolean;
  currentMonthNameFormatLong: string;
  currentMonthNameFormatShort: string;
  next: () => void;
  prev: () => void;
  selectCurrentMonth: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
};

export function useMonthSelector(monthKeys: MonthKey[]): MonthSelectorHook {
  const dispatch = useAppDispatch();
  const monthIndex = useMonthIndex();

  const defaultMonthIndex = monthKeys.length - 1;

  const selectCurrentMonth = () => {
    dispatch(selectMonthIndex(defaultMonthIndex));
  };

  const next = () =>
    dispatch(
      selectMonthIndex(
        monthIndex + 1 < monthKeys.length ? monthIndex + 1 : monthIndex
      )
    );
  const prev = () =>
    dispatch(
      selectMonthIndex(monthIndex - 1 >= 0 ? monthIndex - 1 : monthIndex)
    );
  const currentMonthKey = monthKeys[monthIndex];
  const currentMonthNameFormatLong = formatDate(currentMonthKey);
  const currentMonthNameFormatShort = getMonthName(currentMonthKey);

  const canGoNext = monthIndex < monthKeys.length - 1;
  const canGoPrev = monthIndex > 0;
  const isCurrentMonth = defaultMonthIndex === monthIndex;

  return {
    currentMonthNameFormatLong,
    currentMonthNameFormatShort,
    // Goto next month
    next,
    // Goto prev month
    prev,
    // Goto current month
    selectCurrentMonth,
    isCurrentMonth,
    canGoNext,
    canGoPrev,
  };
}
