/**
 * Represents a month DTO and a mapping of category IDs to arrays of month DTOs
 */
export type CategoryGroupDto = {
  id: string;
  name: string;
  position: number;
};

/**
 * A lookup map of CategoryGroupDto objects keyed by their group ID.
 */
export type CategoryGroupMap = Record<string, CategoryGroupDto>;
