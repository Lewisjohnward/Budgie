import { CategoryGroupSource } from "../categoryGroup.constants";
import {
  CategoryGroupMissingPositionError,
  InvalidCategoryGroupSourceForUserMapperError,
} from "../categoryGroup.errors";
import {
  type DomainUserCategoryGroup,
  asCategoryGroupId,
  type db,
} from "../categoryGroup.types";

/**
 * Maps a Prisma CategoryGroup row into a domain USER category group model.
 * Ensures only USER groups are represented and position is always defined.
 */
export const toDomainUserCategoryGroup = (
  row: db.CategoryGroup
): DomainUserCategoryGroup => {
  if (row.source !== CategoryGroupSource.USER) {
    throw new InvalidCategoryGroupSourceForUserMapperError(row.source);
  }

  if (row.position === null) {
    throw new CategoryGroupMissingPositionError(row.id);
  }

  return {
    id: asCategoryGroupId(row.id),
    name: row.name,
    position: row.position,
    source: CategoryGroupSource.USER,
  };
};
