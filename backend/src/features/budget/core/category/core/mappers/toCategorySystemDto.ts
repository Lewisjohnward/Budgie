import { type DomainSystemCategory } from "../category.types";
import { type CategorySystemDto } from "../types/category.dto";

export const toCategorySystemDto = (
  category: DomainSystemCategory
): CategorySystemDto => {
  return {
    id: category.id,
    categoryGroupId: category.categoryGroupId,
    name: category.name,
  };
};
