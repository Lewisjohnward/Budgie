import { MonthKey } from "../types/types";

/**
 * Returns a human-readable month name for a given position in a sorted
 * list of month keys.
 *
 * This function takes a `MonthKey` array (typically ordered chronologically)
 * and an index, then converts the resolved key into a localized month name.
 *
 * The function assumes that `MonthKey` is in a format compatible with
 * `YYYY-MM` (or similar), allowing it to be safely converted into a `Date`
 * by appending `-01` as the day.
 *
 * If the provided index is out of bounds, the function returns `"Unknown"`.
 *
 * @param monthKeys - Ordered list of month keys (e.g. `["2024-01", "2024-02"]`)
 * @param index - Position in the array representing the desired month
 *
 * @returns The localized month name (e.g. `"January"`) or `"Unknown"` if invalid
 */
export function getMonthName(monthKey: MonthKey): string {
  return new Date(monthKey + "-01T00:00:00").toLocaleString("default", {
    month: "long",
  });
}
