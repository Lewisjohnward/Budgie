import {
  asCategoryGroupId,
  type DomainCategoryGroup,
  type db,
} from "../categoryGroup.types";

/**
 * Maps a Prisma CategoryGroup row into a domain CategoryGroup model
 */
export const toDomainCategoryGroup = (
  row: db.CategoryGroup
): DomainCategoryGroup => {
  const categoryGroup: DomainCategoryGroup = {
    id: asCategoryGroupId(row.id),
    name: row.name,
    position: row.position,
  };
  return categoryGroup;
};
