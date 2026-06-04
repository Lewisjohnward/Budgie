import { type DomainMonth, type MonthDto } from "../category.types";

/**
 * Converts a DomainMonth object into a MonthDto for API responses.
 *
 * @param month - The domain month to convert
 * @returns The corresponding MonthDto with number numeric fields and ISO date
 */
export const toMonthDto = (month: DomainMonth): MonthDto => {
  return {
    id: month.id,
    categoryId: month.categoryId,
    month: month.month.toISOString().slice(0, 7),
    assigned: month.assigned.toNumber(),
    available: month.available.toNumber(),
    activity: month.activity.toNumber(),
  };
};
