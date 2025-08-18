/**
 * Generates an array of the first day of each month between two dates.
 * The inclusivity of the start and end dates can be configured via options.
 *
 * @param startDate - The start date of the range.
 * @param endDate - The end date of the range.
 * @param options - Configuration for inclusivity.
 * @param options.startInclusive - If true, the month of the start date is included. Defaults to false.
 * @param options.endInclusive - If true, the month of the end date is included. Defaults to true.
 * @returns An array of UTC dates representing the first day of each month in the specified range.
 */
export function getMonthRange(
  startDate: Date,
  endDate: Date,
  options: { startInclusive?: boolean; endInclusive?: boolean } = {},
) {
  const { startInclusive = false, endInclusive = true } = options;

  const months: Date[] = [];
  let year = startDate.getUTCFullYear();
  let month = startDate.getUTCMonth();

  // Adjust starting month based on inclusivity
  if (!startInclusive) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  while (
    year < endDate.getUTCFullYear() ||
    (year === endDate.getUTCFullYear() &&
      (endInclusive ? month <= endDate.getUTCMonth() : month < endDate.getUTCMonth()))
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