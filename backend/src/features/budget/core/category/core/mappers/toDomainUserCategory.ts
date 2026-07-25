import { asCategoryGroupId } from "../../../categorygroup/categoryGroup.types";
import {
  asCategoryId,
  type DomainUserCategory,
  type db,
} from "../category.types";

export const toDomainUserCategory = (row: db.Category): DomainUserCategory => {
  if (row.position === null) {
    throw new Error(`User category ${row.id} must have a position`);
  }

  return {
    id: asCategoryId(row.id),
    categoryGroupId: asCategoryGroupId(row.categoryGroupId),
    name: row.name,
    position: row.position,
  };
};
