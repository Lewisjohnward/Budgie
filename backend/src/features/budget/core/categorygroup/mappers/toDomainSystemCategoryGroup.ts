import { CategoryGroupSource } from "../categoryGroup.constants";
import {
  CategoryGroupInvalidSystemPositionError,
  InvalidCategoryGroupSourceForSystemMapperError,
} from "../categoryGroup.errors";
import {
  asCategoryGroupId,
  type DomainSystemCategoryGroup,
  type db,
} from "../categoryGroup.types";

/**
 * Maps a Prisma CategoryGroup row into a domain SYSTEM CategoryGroup model.
 *
 * Ensures only System groups are represented and position is always null.
 */
export const toDomainSystemCategoryGroup = (
  row: db.CategoryGroup
): DomainSystemCategoryGroup => {
  if (row.source !== CategoryGroupSource.SYSTEM) {
    throw new InvalidCategoryGroupSourceForSystemMapperError(row.source);
  }

  if (row.position !== null) {
    throw new CategoryGroupInvalidSystemPositionError(row.id);
  }

  return {
    id: asCategoryGroupId(row.id),
    name: row.name,
    source: CategoryGroupSource.SYSTEM,
  };
};
