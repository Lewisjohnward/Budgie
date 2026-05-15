import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { selectMonthIndex, useMonthIndex } from "../slices/monthSlice";
import { formatDate } from "../utils/dateUtils";
import { MonthKey } from "../types/types";
import { getMonthName } from "../utils/getMonthName";

// Input
type MonthSelectorParams = {
  monthKeys: MonthKey[];
};

// Output
export type MonthSelectorState = {
  isCurrentMonth: boolean;
  currentMonthNameFormatLong: string;
  currentMonthNameFormatShort: string;
  next: () => void;
  prev: () => void;
  selectCurrentMonth: () => void;
  goToNextOrPreviousMonth: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
};

export function useMonthSelector({
  monthKeys,
}: MonthSelectorParams): MonthSelectorState {
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

  const goToNextOrPreviousMonth = () => (canGoNext ? next() : prev());

  return {
    currentMonthNameFormatLong,
    currentMonthNameFormatShort,
    // Goto next month
    next,
    // Goto prev month
    prev,
    // Goto current month
    selectCurrentMonth,
    // Go to previous month if at last month
    goToNextOrPreviousMonth,
    isCurrentMonth,
    canGoNext,
    canGoPrev,
  };
}
