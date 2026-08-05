import { type TransactionNormalDto } from "../../../transaction/transaction.types";
import { type MonthDto } from "./month.dto";

/** Represents a category DTO */

export type CategoryUserDto = {
  id: string;
  categoryGroupId: string;
  name: string;
  position: number;
};

export type CategorySystemDto = {
  id: string;
  categoryGroupId: string;
  name: string;
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
    category: CategoryUserDto;
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
    category: CategoryUserDto;
    months: Record<string, MonthDto>;
  };
  updated: {
    categories: Record<string, CategoryUserDto>;
    transactions: Record<string, TransactionNormalDto>;
    months: Record<string, MonthDto>;
  };
};

/**
 * Represents a minimal state update for a category affected by a repositioning operation.
 *
 * This structure is used as part of a patch-based state reconciliation model, where only
 * the fields affected by ordering changes are returned instead of full category entities.
 *
 * A category position patch is emitted when a category is:
 * - moved within the same group
 * - moved across different category groups
 * - shifted due to reordering of sibling categories
 *
 * It only includes fields required to correctly reconstruct ordering state on the client.
 *
 * Fields:
 * - `id`: Unique identifier of the category
 * - `position`: New zero-based position within its category group
 * - `categoryGroupId`: Identifier of the group the category currently belongs to
 */
export type CategoryPositionPatch = {
  id: string;
  position: number;
  categoryGroupId: string;
};

/**
 * DTO returned after a category update operation.
 *
 * This DTO follows a patch-based state reconciliation model rather than
 * returning a full snapshot of the domain state.
 *
 * It is designed for efficient frontend updates where only affected entities
 * are transmitted, reducing payload size and avoiding redundant data transfer.
 *
 * Supported operations:
 * - Rename category (updates only the target category)
 * - Move category between groups
 * - Reorder categories within a group (may affect multiple siblings)
 *
 * Structure:
 * - `updated.category`:
 *   The primary category that was directly modified by the operation.
 *
 * - `updated.categories`:
 *   A list of category position patches representing all categories affected
 *   by ordering or group changes. Each patch includes only:
 *   - `id`
 *   - `position`
 *   - `categoryGroupId`
 *
 * The frontend is responsible for merging these patches into its local state
 * rather than replacing the entire category collection.
 */
export type UpdateCategoryDto = {
  updated: {
    category: CategoryUserDto;
    categories: CategoryPositionPatch[];
  };
};
