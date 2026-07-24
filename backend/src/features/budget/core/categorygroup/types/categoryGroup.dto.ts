import {
  DomainCategory,
  DomainMonth,
  type MonthDto,
} from "../../category/core/category.types";
import { CategoryDto } from "../../category/core/types/category.dto";
import { type TransactionNormalDto } from "../../transaction/transaction.types";
import { DomainCategoryGroup } from "./categoryGroup.domain";

/**
 * Represents a month DTO and a mapping of category IDs to arrays of month DTOs
 */
export type CategoryGroupSystemDto = {
  id: string;
  name: string;
  position: null;
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
    categories: Record<string, CategoryDto>;
    months: Record<string, MonthDto>;
  };

  updated: {
    categoryGroups: Record<string, CategoryGroupUserDto>;
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
