import { Decimal } from "@prisma/client/runtime/library";
import type { CategoryId, MonthId } from "./category.domain";

/**
 * Month domain type.
 */

export type DomainMonth = {
  id: MonthId;
  categoryId: CategoryId;
  month: Date;
  activity: Decimal;
  assigned: Decimal;
  available: Decimal;
};
