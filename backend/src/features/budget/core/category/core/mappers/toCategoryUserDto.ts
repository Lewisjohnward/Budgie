import { type DomainUserCategory } from "../category.types";
import { type CategoryUserDto } from "../types/category.dto";

export const toCategoryUserDto = (
  category: DomainUserCategory
): CategoryUserDto => {
  return {
    id: category.id,
    categoryGroupId: category.categoryGroupId,
    name: category.name,
    position: category.position,
  };
};
