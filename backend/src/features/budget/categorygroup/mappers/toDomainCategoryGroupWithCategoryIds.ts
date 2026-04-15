import { asCategoryId } from "../../category/core/category.types";
import {
  asCategoryGroupId,
  type db,
  type DomainCategoryGroupWithCategoryIds,
} from "../categoryGroup.types";

/**
 * Maps a Prisma CategoryGroup row (including related categories) into a domain CategoryGroup model
 */
export const toDomainCategoryGroupWithCategoryIds = (
  row: db.CategoryGroupWithCategoryIds
): DomainCategoryGroupWithCategoryIds => {
  const categoryGroup: DomainCategoryGroupWithCategoryIds = {
    id: asCategoryGroupId(row.id),
    name: row.name,
    position: row.position,
    categoryIds: row.categories.map((c) => asCategoryId(c.id)),
  };
  return categoryGroup;
};
