import { Brand } from "../../../../../shared/types/brand";
import { type UserId } from "../../../../user/auth/auth.types";
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

export type DomainCategory = {
  id: CategoryId;
  userId: UserId;
  categoryGroupId: CategoryGroupId;
  name: string;
  position: number;
};
