import { type DomainNormalTransaction } from "../../../transaction/transaction.types";
import { type DomainCategory, type DomainMonth } from "../category.types";

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
  deletedCategory: DomainCategory;
  deletedMonths: DomainMonth[];
  // categories are needed for new positions
  updatedCategories: DomainCategory[];
  updatedMonths: DomainMonth[];
  updatedTransactions: DomainNormalTransaction[];
};
