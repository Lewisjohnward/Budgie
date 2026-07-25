import { type DomainSystemCategory } from "../../category.types";
import { categoryMapper } from "../../category.mapper";
import { type UserId } from "../../../../../../user/auth/auth.types";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import {
  PROTECTED_CATEGORY_NAMES,
  ProtectedCategoryName,
} from "../../category.constants";

// TODO:(lewis 2026-07-25 11:18) smell: this is just covering up the fact the db has position Int for category
export const getSystemCategories = async (
  userId: UserId
): Promise<DomainSystemCategory[]> => {
  const rawCategories = await categoryRepository.getCategories(userId);

  const systemCategories = rawCategories
    .filter((category) =>
      PROTECTED_CATEGORY_NAMES.includes(category.name as ProtectedCategoryName)
    )
    .map(categoryMapper.toDomainSystemCategory);

  if (systemCategories.length !== 2) {
    throw new Error("Missing system categories");
  }
  return systemCategories;
};
