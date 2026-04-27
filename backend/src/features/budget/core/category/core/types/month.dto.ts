/** Represents a month DTO and a mapping of category IDs to arrays of month DTOs */

import { MonthId } from "../category.types";

export type MonthDto = {
  id: string;
  categoryId: string;
  month: string;
  activity: number;
  assigned: number;
  available: number;
};

export type UpdatedMonthsByCategoryDto = Record<string, MonthDto[]>;

export type UpdatedMonthsById = Record<MonthId, MonthDto>;
