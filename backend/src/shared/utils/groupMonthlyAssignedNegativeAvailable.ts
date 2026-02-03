import { Decimal } from "@prisma/client/runtime/library";

type MonthlyAssignedNegativeAvailable = Record<
  string,
  { assigned: Decimal; negativeAvailable: Decimal }
>;

type MonthSlice = { month: Date; assigned: Decimal; available: Decimal };

/**
 * Groups monthly slices by year-month and aggregates their assigned amounts
 * and negative available balances.
 *
 * Each input month is grouped using the `YYYY-MM` portion of its ISO date.
 * For every group:
 * - `assigned` is the sum of all `assigned` values.
 * - `negativeAvailable` is the sum of all `available` values that are less than zero.
 *
 * @param {Array<{ month: Date, assigned: Decimal, available: Decimal }>} months
 * An array of month slices containing:
 * - `month`: The date representing the month.
 * - `assigned`: The assigned amount for that month.
 * - `available`: The available balance for that month.
 *
 * @returns {Record<string, { assigned: Decimal, negativeAvailable: Decimal }>}
 * An object keyed by `YYYY-MM`, where each value contains:
 * - `assigned`: The total assigned amount for that month.
 * - `negativeAvailable`: The total of negative available balances for that month.
 *
 * @example
 * const result = groupMonthlyAssignedNegativeAvailable(months);
 * // {
 * //   "2025-01": { assigned: Decimal(...), negativeAvailable: Decimal(...) },
 * //   "2025-02": { assigned: Decimal(...), negativeAvailable: Decimal(...) }
 * // }
 */

export function groupMonthlyAssignedNegativeAvailable(
  months: MonthSlice[]
): Record<string, { assigned: Decimal; negativeAvailable: Decimal }> {
  const result: MonthlyAssignedNegativeAvailable = {};
  months.forEach((m) => {
    const key = m.month.toISOString().slice(0, 7);
    if (!result[key]) {
      result[key] = {
        assigned: new Decimal(0),
        negativeAvailable: new Decimal(0),
      };
    }
    result[key].assigned = result[key].assigned.add(m.assigned);
    if (m.available.lt(0)) {
      result[key].negativeAvailable = result[key].negativeAvailable.add(
        m.available
      );
    }
  });
  return result;
}
