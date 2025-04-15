import { startOfMonth } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
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

export const roundToStartOfMonth = (date: Date) => {
  const timeZone = "UTC";
  const zoned = toZonedTime(date, timeZone);
  const startZoned = startOfMonth(zoned);
  const startUtc = fromZonedTime(startZoned, timeZone);
  return startUtc;
};
