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
  if (row.source !== "USER") {
    throw new Error("Expected USER category group");
  }

  if (row.position === null) {
    throw new Error("Invalid state: USER category group has null position");
  }

  return {
    id: asCategoryGroupId(row.id),
    name: row.name,
    position: row.position,
    source: mapSource(row.source),
  };
};

import { CategoryGroupSource as PrismaSource } from "@prisma/client";
import { CategoryGroupSource as DomainSource } from "../categoryGroup.constants";

export const mapSource = (source: PrismaSource): DomainSource => {
  switch (source) {
    case PrismaSource.USER:
      return DomainSource.USER;
    case PrismaSource.SYSTEM:
      return DomainSource.SYSTEM;
  }
};
