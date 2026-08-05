import { type DomainNormalTransaction } from "../../../transaction/transaction.types";
import { type DomainUserCategory, type DomainMonth } from "../category.types";

/**
 * Domain result of the category deletion use case.
 *
 * Represents the full set of state changes produced when deleting a category
 *
 * This includes:
 * - The category that was deleted
 * - Any months that were deleted
 * - Any months of the inheriting category that were updated
 */
export type DeleteCategoryResult = {
  deletedCategory: DomainUserCategory;
  deletedMonths: DomainMonth[];
  // categories are needed for new positions
  updatedCategories: DomainUserCategory[];
  updatedMonths: DomainMonth[];
  updatedTransactions: DomainNormalTransaction[];
};
