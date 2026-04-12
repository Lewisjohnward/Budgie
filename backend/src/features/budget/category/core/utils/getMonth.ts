import { roundToStartOfMonth } from "../../../../../shared/utils/roundToStartOfMonth";

type MonthRange = {
  /** Start of the current calendar month (UTC-normalised). */
  startOfCurrentMonth: Date;

  /** Start of the next calendar month (UTC-normalised). */
  nextMonth: Date;
};

/**
 * Returns normalized month boundaries used for budget initialization.
 *
 * - `startOfCurrentMonth` is rounded to the first day of the current month
 * - `nextMonth` is computed in UTC to avoid timezone drift issues
 *
 * @returns An object containing the current and next month start dates.
 */
export const getMonth = (): MonthRange => {
  const today = new Date();
  const startOfCurrentMonth = roundToStartOfMonth(today);

  // Create next month date directly in UTC to avoid timezone issues
  const nextMonth = new Date(
    Date.UTC(
      startOfCurrentMonth.getUTCFullYear(),
      startOfCurrentMonth.getUTCMonth() + 1,
      1,
      0,
      0,
      0,
      0
    )
  );

  return { startOfCurrentMonth, nextMonth };
};
