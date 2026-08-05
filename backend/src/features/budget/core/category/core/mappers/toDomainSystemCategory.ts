import { asCategoryGroupId } from "../../../categorygroup/categoryGroup.types";
import {
  asCategoryId,
  type DomainSystemCategory,
  type db,
} from "../category.types";

export const toDomainSystemCategory = (
  row: db.Category
): DomainSystemCategory => {
  // if (row.position !== null) {
  //   throw new Error(
  //     `System category ${row.id} must not have a position ${JSON.stringify(row)}`
  //   );
  // }
  const category: DomainSystemCategory = {
    id: asCategoryId(row.id),
    categoryGroupId: asCategoryGroupId(row.categoryGroupId),
    name: row.name,
  };
  return category;
};
