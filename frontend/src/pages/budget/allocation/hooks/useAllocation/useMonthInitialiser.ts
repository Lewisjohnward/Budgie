import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { useEffect } from "react";
import {
  useHasInitialisedMonth,
  selectMonthIndex,
  setHasInitialisedMonth,
} from "../../slices/monthSlice";
import { MonthKey } from "../../types/types";
import { getCurrentMonthKey } from "../../utils/dateUtils";

// Input
type UseMonthInitialiserParams = {
  monthKeys: MonthKey[];
};

export function useMonthInitialiser({ monthKeys }: UseMonthInitialiserParams) {
  const dispatch = useAppDispatch();
  const hasInitialisedMonth = useHasInitialisedMonth();

  const currentMonthKey = getCurrentMonthKey();

  const defaultMonthIndex = monthKeys.indexOf(currentMonthKey);

  useEffect(() => {
    if (hasInitialisedMonth) return;

    dispatch(selectMonthIndex(defaultMonthIndex));
    dispatch(setHasInitialisedMonth(true));
  }, [dispatch, hasInitialisedMonth, defaultMonthIndex]);
}
