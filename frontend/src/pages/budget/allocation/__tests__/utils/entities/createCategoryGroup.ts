import {
  ApiCategoryGroupUser,
  ApiCategoryGroupSystem,
} from "@/core/types/exported-types";

export function createUserCategoryGroup(
  id: string,
  overrides?: Partial<ApiCategoryGroupUser>
): ApiCategoryGroupUser {
  return {
    id,
    name: "default",
    position: 0,
    ...overrides,
  };
}

export function createSystemCategoryGroup(
  id: string,
  overrides?: Partial<ApiCategoryGroupSystem>
): ApiCategoryGroupSystem {
  return {
    id,
    name: "default",
    ...overrides,
  };
}
