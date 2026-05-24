import {
  asCategoryGroupId,
  type DomainSystemCategoryGroup,
  type db,
} from "../categoryGroup.types";
import { mapSource } from "./toDomainUserCategoryGroup";

/**
 * Maps a Prisma CategoryGroup row into a domain SYSTEM CategoryGroup model.
 *
 * Ensures only System groups are represented and position is always null.
 */
export const toDomainSystemCategoryGroup = (
  row: db.CategoryGroup
): DomainSystemCategoryGroup => {
  if (row.source !== "SYSTEM") {
    throw new Error("Expected USER category group");
  }

  if (row.position !== null) {
    throw new Error("Invalid state: USER category group has null position");
  }

  return {
    id: asCategoryGroupId(row.id),
    name: row.name,
    position: row.position,
    source: mapSource(row.source),
  };
};
