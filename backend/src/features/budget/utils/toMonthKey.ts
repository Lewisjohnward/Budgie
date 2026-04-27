import { MonthKey, asMonthKey } from "../queries/hydration/hydration.types";

/**
 * Normalises a date value into a branded `MonthKey` in the format `YYYY-MM`.
 *
 * This utility accepts either a `Date` object or an ISO date string and converts
 *
 * Behaviour:
 * - If input is a `Date`, it is converted to an ISO string first
 * - If input is a string, it is assumed to be ISO-compatible
 * - Only the year-month portion (`YYYY-MM`) is retained
 * - The result is branded as `MonthKey` via `asMonthKey`
 *
 * @param date - A `Date` object or ISO date string
 * @returns A branded `MonthKey` in `YYYY-MM` format
 */
export const toMonthKey = (date: string | Date): MonthKey => {
  const d = (typeof date === "string" ? date : date.toISOString()).slice(0, 7);

  return asMonthKey(d);
};
