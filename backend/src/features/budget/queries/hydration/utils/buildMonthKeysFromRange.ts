import { asMonthKey, type MonthKey } from "../hydration.types";

/**
 * Builds a continuous list of month keys between two dates (inclusive).
 *
 * Each month is normalized to the format `YYYY-MM`, derived in UTC to ensure
 * consistent behaviour regardless of local timezone differences.
 *
 * Behaviour:
 * - The range is inclusive of both `from` and `to` months
 * - Both dates are normalized to the first day of their respective months
 * - Iteration is performed in UTC to avoid timezone drift issues
 * - Output is ordered chronologically from start → end
 *
 * @param from - Start date of the range (any day within the starting month)
 * @param to - End date of the range (any day within the ending month)
 * @returns Array of month keys in chronological order
 */

// THIS IS CURRENTLY UNUSED UNTIL first month for user is added as a field to the database

export const buildMonthKeysFromRange = (from: Date, to: Date): MonthKey[] => {
  const keys: MonthKey[] = [];

  const current = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1)
  );
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));

  while (current <= end) {
    keys.push(asMonthKey(current.toISOString().slice(0, 7)));

    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return keys;
};
