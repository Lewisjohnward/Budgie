/**
 * ======================
 * Normalised category domain types
 * ======================
 */

import { type CategoryId, type MonthId } from "./category.domain";
import { type CategoryGroupId } from "../../../categorygroup/categoryGroup.types";

export type NormalisedData = NormalisedCategoryData & {
  monthKeys: string[];
  memoByMonth: MemoByMonth;
};

export type NormalisedCategoryData = {
  categoryGroups: CategoryGroupById;
  categories: CategoryById;
  months: MonthById;
};

/**
 * Normalised entity maps
 */

export type CategoryGroupById = Record<
  CategoryGroupId,
  NormalisedCategoryGroup
>;
export type CategoryById = Record<CategoryId, NormalisedCategory>;
export type MonthById = Record<MonthId, NormalisedMonth>;

/**
 * Normalised entities
 */

export type NormalisedCategoryGroup = {
  id: CategoryGroupId;
  name: string;
  position: number;
  categories: CategoryId[];
};

export type NormalisedCategory = {
  id: CategoryId;
  name: string;
  position: number;
  categoryGroupId: CategoryGroupId;
  months: MonthId[];
};

export type NormalisedMonth = {
  id: MonthId;
  categoryId: CategoryId;
  month: string;
  activity: number;
  assigned: number;
  available: number;
};

export type MemoByMonth = Record<string, MemoSummary>;

export type MemoSummary = {
  id: string;
  month: string;
  content: string;
};
