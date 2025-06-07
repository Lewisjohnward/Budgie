/**
 * Generates an array of the first day of each month between two dates (exclusive of the end month).
 *
 * - Each month is represented as a `Date` object at the first day of that month in UTC.
 * - The end date is **not** included unless it falls in a different month than the start.
 *
 * Example:
 *   getIntermediateMonths(new Date("2025-01-15"), new Date("2025-04-10"))
 *   => [2025-01-01, 2025-02-01, 2025-03-01]
 *
 * @param startDate - The start date (inclusive).
 * @param endDate - The end date (exclusive).
 * @returns An array of UTC dates representing the first day of each month between the two dates.
 */

export function getIntermediateMonths(startDate: Date, endDate: Date) {
  let months = [];

  let year = startDate.getUTCFullYear();
  let month = startDate.getUTCMonth();

  while (
    year < endDate.getUTCFullYear() ||
    (year === endDate.getUTCFullYear() && month < endDate.getUTCMonth())
  ) {
    months.push(new Date(Date.UTC(year, month, 1)));

    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return months;
}
