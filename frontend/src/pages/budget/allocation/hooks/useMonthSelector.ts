import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { month, selectMonthIndex } from "../slices/monthSlice";
import { formatDate } from "../utils/dateUtils";

// TODO: Persist Month Selection Across Sessions

export function useMonthSelector(months: string[]) {
  const dispatch = useAppDispatch();
  const monthState = useAppSelector(month);
  const formattedMonths = months.map((month) => formatDate(month));

  const now = new Date();

  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const currentMonthIndex = months.indexOf(currentMonth);

  const selectCurrentMonth = () => {
    dispatch(selectMonthIndex(currentMonthIndex));
  };

  const next = () =>
    dispatch(
      selectMonthIndex(
        monthState.month + 1 < months.length
          ? monthState.month + 1
          : monthState.month,
      ),
    );
  const prev = () =>
    dispatch(
      selectMonthIndex(
        monthState.month - 1 >= 0 ? monthState.month - 1 : monthState.month,
      ),
    );

  const current = formattedMonths[monthState.month] ?? "";

  const canGoNext = monthState.month < months.length - 1;
  const canGoPrev = monthState.month > 0;

  return {
    index: monthState.month,
    current,
    next,
    prev,
    selectCurrentMonth,
    canGoNext,
    canGoPrev,
  };
}
