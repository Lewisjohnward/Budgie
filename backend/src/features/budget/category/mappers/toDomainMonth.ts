import { asCategoryId, asMonthId, db, type DomainMonth } from "../category.types";

export const toDomainMonth = (row: db.Month): DomainMonth => {
  const month: DomainMonth = {
    id: asMonthId(row.id),
    categoryId: asCategoryId(row.categoryId),
    month: row.month,
    activity: row.activity,
    assigned: row.assigned,
    available: row.available,
  };
  return month;
};
