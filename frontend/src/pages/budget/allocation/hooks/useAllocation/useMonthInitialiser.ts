import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { useEffect } from "react";
import {
  useHasInitialisedMonth,
  selectMonthIndex,
  setHasInitialisedMonth,
} from "../../slices/monthSlice";
import { MonthKey } from "../../types/types";

// Input
type UseMonthInitialiserParams = {
  monthKeys: MonthKey[];
};

export function useMonthInitialiser({ monthKeys }: UseMonthInitialiserParams) {
  const dispatch = useAppDispatch();
  const hasInitialisedMonth = useHasInitialisedMonth();

  const defaultMonthIndex = monthKeys.length - 1;

  useEffect(() => {
    if (hasInitialisedMonth) return;

    dispatch(selectMonthIndex(defaultMonthIndex));
    dispatch(setHasInitialisedMonth(true));
  }, [dispatch, hasInitialisedMonth, defaultMonthIndex]);
}
