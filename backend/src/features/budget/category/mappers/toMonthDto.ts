import { type DomainMonth, type MonthDto } from "../category.types";

/**
 * Converts a DomainMonth object into a MonthDto for API responses.
 *
 * @param month - The domain month to convert
 * @returns The corresponding MonthDto with stringified numeric fields and ISO date
 */
export const toMonthDto = (month: DomainMonth): MonthDto => {
  return {
    id: month.id,
    categoryId: month.categoryId,
    month: month.month.toISOString(),
    assigned: month.assigned.toString(),
    available: month.available.toString(),
    activity: month.activity.toString(),
  };
};
