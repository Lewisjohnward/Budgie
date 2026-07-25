import { asCategoryGroupId } from "../../../categorygroup/categoryGroup.types";
import {
  asCategoryId,
  type DomainSystemCategory,
  type db,
} from "../category.types";

export const toDomainSystemCategory = (
  row: db.Category
): DomainSystemCategory => {
  if (row.position !== null) {
    throw new Error(`User category ${row.id} must have a position`);
  }
  const category: DomainSystemCategory = {
    id: asCategoryId(row.id),
    categoryGroupId: asCategoryGroupId(row.categoryGroupId),
    name: row.name,
  };
  return category;
};
