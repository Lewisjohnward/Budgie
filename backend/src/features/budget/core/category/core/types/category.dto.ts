import { TransactionNormalDto } from "../../../transaction/transaction.types";
import { type MonthDto } from "./month.dto";

/** Represents a category DTO */

export type CategoryDto = {
  id: string;
  categoryGroupId: string;
  name: string;
  position: number;
};

/**
 * DTO returned after a category creation operation.
 *
 * This DTO represents a partial state update intended for client-side
 * hydration or incremental state reconciliation.
 *
 * It does not return a full snapshot of the budget state; instead, it
 * provides only the entities that were directly affected by the operation.
 *
 * Structure:
 * - `created`: Identifies the entities that were created.
 */
export type CreateCategoryDto = {
  created: {
    category: CategoryDto;
    months: Record<string, MonthDto>;
  };
};

/**
 * DTO returned after a category deletion operation.
 *
 * This DTO represents a partial state update intended for client-side
 * hydration or incremental state reconciliation.
 *
 * It does not return a full snapshot of the budget state; instead, it
 * provides only the entities that were directly affected by the operation.
 *
 * Structure:
 * - `created`: Identifies the entities that were created.
 */
export type DeleteCategoryDto = {
  deleted: {
    category: CategoryDto;
    months: Record<string, MonthDto>;
  };
  updated: {
    transactions: Record<string, TransactionNormalDto>;
    months: Record<string, MonthDto>;
  };
};
