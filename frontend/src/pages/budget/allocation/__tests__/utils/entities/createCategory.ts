import {
  CategorySystemBranded,
  CategoryUserBranded,
} from "@/core/types/NormalizedData";
import {
  ApiCategorySystem,
  ApiCategoryUser,
} from "@/core/types/exported-types";

export function createUserCategory(
  id: string,
  categoryGroupId: string,
  overrides?: Partial<CategoryUserBranded>
): ApiCategoryUser {
  return {
    id,
    name: "default",
    categoryGroupId,
    position: 0,
    ...overrides,
  };
}

export function createSystemCategory(
  id: string,
  categoryGroupId: string,
  overrides?: Partial<CategorySystemBranded>
): ApiCategorySystem {
  return {
    id,
    name: "default",
    categoryGroupId,
    ...overrides,
  };
}
