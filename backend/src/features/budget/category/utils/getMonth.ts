import { roundToStartOfMonth } from "../../../../shared/utils/roundToStartOfMonth";

export const getMonth = () => {
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
      0,
    ),
  );

  return { startOfCurrentMonth, nextMonth };
};