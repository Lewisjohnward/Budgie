import { roundToStartOfMonth } from "./roundToStartOfMonth";

export const getMonth = () => {
  const today = new Date();
  const startOfCurrentMonth = roundToStartOfMonth(today);

  const nextMonth = new Date(
    startOfCurrentMonth.getFullYear(),
    startOfCurrentMonth.getMonth() + 1,
    1,
    1,
  );

  return { startOfCurrentMonth, nextMonth };
};
