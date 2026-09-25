import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { selectMonthIndex, useMonthIndex } from "../slices/monthSlice";
import { formatDate, getCurrentMonthKey } from "../utils/dateUtils";
import { MonthKey } from "../types/types";
import { getMonthName } from "../utils/getMonthName";

// Input
type MonthSelectorParams = {
  monthKeys: MonthKey[];
};

// Output
export type MonthSelectorViewModel = {
  current: {
    isCurrent: boolean;
    labelLong: string;
    labelShort: string;
  };

  navigation: {
    next: () => void;
    prev: () => void;

    selectCurrent: () => void;
    goToNextOrPrevious: () => void;

    canGoNext: boolean;
    canGoPrev: boolean;
  };
};

export function useMonthSelectorViewModel({
  monthKeys,
}: MonthSelectorParams): MonthSelectorViewModel {
  const dispatch = useAppDispatch();
  const monthIndex = useMonthIndex();

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

  const currentMonthKey = getCurrentMonthKey();
  const currentMonthIndex = monthKeys.indexOf(currentMonthKey);
  const selectedMonthKey = monthKeys[monthIndex];

  const selectCurrent = () => {
    if (currentMonthIndex !== -1) {
      dispatch(selectMonthIndex(currentMonthIndex));
    }
  };

  const canGoNext = monthIndex < monthKeys.length - 1;
  const canGoPrev = monthIndex > 0;
  const isCurrentMonth = monthIndex === currentMonthIndex;

  const currentMonthNameFormatLong = formatDate(selectedMonthKey);
  const currentMonthNameFormatShort = getMonthName(selectedMonthKey);

  const goToNextOrPrevious = () => (canGoNext ? next() : prev());

  return {
    current: {
      isCurrent: isCurrentMonth,
      labelLong: currentMonthNameFormatLong,
      labelShort: currentMonthNameFormatShort,
    },

    navigation: {
      // Goto next month
      next,
      // Goto prev month
      prev,
      // Goto current month
      selectCurrent,
      // Go to previous month if at last month
      goToNextOrPrevious,
      canGoNext,
      canGoPrev,
    },
  };
}
