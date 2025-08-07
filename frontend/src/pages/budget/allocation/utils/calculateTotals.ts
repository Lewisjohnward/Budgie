import { Category } from "@/core/types/NormalizedData";
import { Month } from "@/core/types/Allocation";

type NumericMonthKeys = "available" | "assigned" | "activity";

/**
 * Calculates the total available, assigned, spending, and leftover amounts for a selection of categories.
 *
 * @param categories - An array of category objects to be included in the calculation.
 * @param months - A record of all month objects, keyed by their ID.
 * @param currentIndex - The index of the current month in the category's months array.
 * @returns An object containing the summed totals for 'available', 'assigned', 'spending', and 'leftover'.
 */

export function calculateTotals(
  categories: Category[],
  months: Record<string, Month>,
  currentIndex: number
) {
  const getMonthsAtIndex = (index: number) =>
    categories.flatMap((category) => {
      if (index < 0) return [];
      const m = category.months[index];
      return m !== undefined ? [months[m]] : [];
    });

  const previousMonths = getMonthsAtIndex(currentIndex - 1);
  const currentMonths = getMonthsAtIndex(currentIndex);

  const sum = (arr: Month[], key: NumericMonthKeys) =>
    arr.reduce((total, m) => total + m[key], 0);

  const sumPositive = (arr: Month[], key: NumericMonthKeys) =>
    arr.reduce((total, m) => total + Math.max(0, m[key]), 0);

  return {
    available: sum(currentMonths, "available"),
    assigned: sum(currentMonths, "assigned"),
    spending: sum(currentMonths, "activity"),
    leftover: sumPositive(previousMonths, "available"),
  };
}
