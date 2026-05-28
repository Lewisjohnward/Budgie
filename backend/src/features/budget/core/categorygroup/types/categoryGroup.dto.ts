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
 * DTO returned from the API after deleting a category group.
 *
 * Contains a normalized snapshot of all side effects produced by the operation,
 * including deleted entities, transaction reassignment mappings, and updated month values.
 */
export type DeleteCategoryGroupDto = {
  deletedCategoryGroupId: string;
  deletedCategoryIds: string[];

  transactionReassignments: Record<string, string>;

  monthUpdates: Record<
    string,
    {
      activity: number;
      assigned: number;
    }
  >;
};
