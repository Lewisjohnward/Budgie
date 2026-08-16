import { type MonthDto } from "../../category/core/category.types";
import { CategoryUserDto } from "../../category/core/types/category.dto";
import { type TransactionNormalDto } from "../../transaction/transaction.types";

/**
 * Represents a month DTO and a mapping of category IDs to arrays of month DTOs
 */
export type CategoryGroupSystemDto = {
  id: string;
  name: string;
};

export type CategoryGroupUserDto = {
  id: string;
  name: string;
  position: number;
};

// TODO:(lewis 2026-05-22 04:28) this needs changing
/**
 * A lookup map of CategoryGroupDto objects keyed by their group ID.
 */
export type CategoryGroupsMap = {
  user: CategoryGroupUserMap;
  system: CategoryGroupSystemMap;
};

export type CategoryGroupUserMap = Record<string, CategoryGroupUserDto>;

export type CategoryGroupSystemMap = Record<string, CategoryGroupSystemDto>;

/**
 * DTO returned after a category group deletion operation.
 *
 * This DTO represents a partial state update intended for client-side
 * hydration or incremental state reconciliation.
 *
 * It does not return a full snapshot of the budget state; instead, it
 * provides only the entities that were directly affected by the operation.
 *
 * Structure:
 * - `deleted`: Identifies the category group that was removed.
 * - `updated.transactions`: Transactions that were modified as a result of
 *   reassignment (e.g. category changes due to group deletion).
 * - `updated.months`: Month aggregates that were recalculated due to
 *   transaction reassignment.
 */
export type DeleteCategoryGroupDto = {
  deleted: {
    categoryGroup: CategoryGroupUserDto;
    categories: Record<string, CategoryUserDto>;
    months: Record<string, MonthDto>;
  };

  updated: {
    categoryGroups: CategoryGroupPositionPatch[];
    transactions: Record<string, TransactionNormalDto>;
    months: Record<string, MonthDto>;
  };
};

/**
 * DTO returned after a category group creation operation.
 */
export type CreateCategoryGroupDto = {
  created: {
    categoryGroup: CategoryGroupUserDto;
  };
};

/**
 * Represents a minimal state update for a category group affected by a repositioning operation.
 *
 * This structure is used as part of a patch-based state reconciliation model, where only
 * the fields affected by ordering changes are returned instead of full category entities.
 *
 * A category group position patch is emitted when a category group is:
 * - shifted due to reordering of sibling categories
 *
 * It only includes fields required to correctly reconstruct ordering state on the client.
 *
 * Fields:
 * - `id`: Unique identifier of the category
 * - `position`: New zero-based position within its category group
 */
export type CategoryGroupPositionPatch = {
  id: string;
  position: number;
};

/**
 * DTO returned after a category group update operation.
 *
 * This DTO follows a patch-based state reconciliation model rather than
 * returning a full snapshot of the domain state.
 *
 * It is designed for efficient frontend updates where only affected entities
 * are transmitted, reducing payload size and avoiding redundant data transfer.
 *
 * Supported operations:
 * - Rename category group (updates only the target category group)
 * - Move category groups
 *
 * Structure:
 * - `updated.categoryGroup`:
 *   The primary category group that was directly modified by the operation.
 *
 * - `updated.categories`:
 *   A list of category position patches representing all category groups affected
 *   by ordering changes. Each patch includes only:
 *   - `id`
 *   - `position`
 *
 * The frontend is responsible for merging these patches into its local state
 * rather than replacing the entire category collection.
 */
export type UpdateCategoryGroupDto = {
  updated: {
    categoryGroup: CategoryGroupUserDto;
    categoryGroups: CategoryGroupPositionPatch[];
  };
};
