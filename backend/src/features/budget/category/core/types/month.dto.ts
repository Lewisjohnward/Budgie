/** Represents a month DTO and a mapping of category IDs to arrays of month DTOs */

export type MonthDto = {
  id: string;
  categoryId: string;
  month: string;
  activity: string;
  assigned: string;
  available: string;
};

export type UpdatedMonthsByCategoryDto = Record<string, MonthDto[]>;
