/** Represents a month DTO and a mapping of category IDs to arrays of month DTOs */

export type CategoryGroupDto = {
  id: string;
  userId: string;
  name: string;
  position: number;
};

export type CategoryGroupMap = Record<string, CategoryGroupDto>;
