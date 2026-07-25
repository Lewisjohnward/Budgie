import { Brand } from "../../../../../../shared/types/brand";
import type { CategoryGroupId } from "../../../categorygroup/categoryGroup.types";

/**
 * Category-related domain identifiers.
 */

export type CategoryId = Brand<string, "CategoryId">;
export type MonthId = Brand<string, "MonthId">;

/**
 * Unsafe constructors for domain IDs.
 * Callers are responsible for ensuring correctness.
 */

export const asCategoryId = (id: string) => id as CategoryId;
export const asMonthId = (id: string) => id as MonthId;

/**
 * Category aggregate root.
 */

export type DomainUserCategory = {
  id: CategoryId;
  categoryGroupId: CategoryGroupId;
  name: string;
  position: number;
};

/**
 * Category aggregate root.
 */

export type DomainSystemCategory = {
  id: CategoryId;
  categoryGroupId: CategoryGroupId;
  name: string;
};
