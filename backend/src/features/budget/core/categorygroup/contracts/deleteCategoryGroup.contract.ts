import { type DomainMonth } from "../../category/core/category.types";
import { type DomainNormalTransaction } from "../../transaction/transaction.types";
import { type CategoryGroupId } from "../categoryGroup.types";

/**
 * Represents the full domain-level result of a category group deletion operation.
 *
 * This structure captures all side effects produced by the use case in a single
 * transactional operation, including:
 *
 * - The category group that was deleted
 * - Transactions that were reassigned due to the deletion
 * - Any category group state changes resulting from reindexing
 *
 * This result is intended to be:
 * - A complete source-of-truth snapshot of what changed during the operation
 * - Mapped into a DTO for client hydration
 * - Used to ensure frontend state consistency after a destructive action
 */
export type DeleteCategoryGroupResult = {
  deletedCategoryGroupId: CategoryGroupId;
  // TODO:(lewis 2026-06-12 10:53) shouldn-t this also have deletedMonths?

  updatedTransactions: DomainNormalTransaction[];
  updatedMonths: DomainMonth[];
};
