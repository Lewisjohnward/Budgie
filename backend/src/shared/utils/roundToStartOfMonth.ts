import { startOfMonth } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";


export const roundToStartOfMonth = (date: Date) => {
  const timeZone = "UTC";
  const zoned = toZonedTime(date, timeZone);
  const startZoned = startOfMonth(zoned);
  const startUtc = fromZonedTime(startZoned, timeZone);
  return startUtc;
};
