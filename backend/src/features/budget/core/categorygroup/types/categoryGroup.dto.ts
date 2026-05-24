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
