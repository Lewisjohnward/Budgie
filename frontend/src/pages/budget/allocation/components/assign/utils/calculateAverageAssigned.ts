import { Month } from "@/core/types/Allocation";

type MonthForAverageSpend = Pick<Month, "month" | "assigned" | "categoryId">;

export interface CategoryAverageStats {
  averageAssignedByCategory: Map<string, number>;
  totalAverageAssigned: number;
}

export const calculateAverageAssigned = (
  months: MonthForAverageSpend[],
  currentMonthIndex: number
): CategoryAverageStats => {
  const uniqueMonths = [...new Set(months.map((m) => m.month))];

  const previousYearMonthDates = uniqueMonths.slice(
    Math.max(0, currentMonthIndex - 12),
    currentMonthIndex
  );

  const previousYearMonths = months.filter((m) =>
    previousYearMonthDates.includes(m.month)
  );

  // Calculate category statistics with first non-zero index tracking
  const categoryStats = previousYearMonths.reduce(
    (acc, month) => {
      if (!acc[month.categoryId]) {
        acc[month.categoryId] = { sum: 0, count: 0, indexOfFirstNonZero: -1 };
      }

      acc[month.categoryId].sum += month.assigned;
      acc[month.categoryId].count += 1;

      if (
        month.assigned !== 0 &&
        acc[month.categoryId].indexOfFirstNonZero === -1
      ) {
        acc[month.categoryId].indexOfFirstNonZero =
          acc[month.categoryId].count - 1;
      }

      return acc;
    },
    {} as Record<
      string,
      { sum: number; count: number; indexOfFirstNonZero: number }
    >
  );

  // Calculate average activity per category with ceiling rounding
  const averageAssignedByCategory = new Map<string, number>();

  for (const categoryId in categoryStats) {
    const stats = categoryStats[categoryId];
    if (stats.count > 0) {
      const average =
        Math.ceil(
          (stats.sum / (stats.count - stats.indexOfFirstNonZero)) * 100
        ) / 100;
      averageAssignedByCategory.set(categoryId, average);
    }
  }

  // Calculate total average spend across all categories
  const totalAverageAssigned = Number(
    Array.from(averageAssignedByCategory.values())
      .reduce((sum, value) => sum + value, 0)
      .toFixed(2)
  );

  return {
    averageAssignedByCategory,
    totalAverageAssigned,
  };
};
