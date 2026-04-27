import { MonthKey, CategoryMonthMap } from "../types/types";

export function resolvePreviousYearMonthMaps(
  monthsByDate: Record<MonthKey, CategoryMonthMap>,
  monthKeys: MonthKey[],
  monthIndex: number
): CategoryMonthMap[] {
  if (monthIndex === 0) return [];

  const start = Math.max(0, monthIndex - 12);
  const keys = monthKeys.slice(start, monthIndex);

  return keys.map((key) => monthsByDate[key]).filter(Boolean);
}
