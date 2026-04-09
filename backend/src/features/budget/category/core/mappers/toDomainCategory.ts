import { asUserId } from "../../../../user/auth/auth.types";
import { asCategoryGroupId } from "../../../categorygroup/categoryGroup.types";
import { asCategoryId, type db, type DomainCategory } from "../category.types";

export const toDomainCategory = (row: db.Category): DomainCategory => {
  const category: DomainCategory = {
    id: asCategoryId(row.id),
    userId: asUserId(row.userId),
    categoryGroupId: asCategoryGroupId(row.categoryGroupId),
    name: row.name,
    position: row.position,
  };
  return category;
};
