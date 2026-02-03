import { asUserId } from "../../../user/auth/auth.types";
import {
  asCategoryGroupId,
  type db,
  type DomainCategoryGroup,
} from "../categoryGroup.types";

export const toDomainCategoryGroup = (
  row: db.CategoryGroup
): DomainCategoryGroup => {
  const categoryGroup: DomainCategoryGroup = {
    id: asCategoryGroupId(row.id),
    userId: asUserId(row.userId),
    name: row.name,
    position: row.position,
  };
  return categoryGroup;
};
