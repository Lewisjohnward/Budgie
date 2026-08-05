import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { type UserId } from "../../../../../../user/auth/auth.types";
import { SYSTEM_CATEGORY_NAMES } from "../../category.constants";
import { categoryMapper } from "../../category.mapper";
import { type DomainUserCategory } from "../../category.types";

// TODO:(lewis 2026-07-25 11:18) smell: this is just covering up the fact the db has position Int for category
export const getUserCategories = async (
  userId: UserId
): Promise<DomainUserCategory[]> => {
  const rawCategories = await categoryRepository.getCategories(userId);

  return rawCategories
    .filter(
      (category) =>
        !Object.values(SYSTEM_CATEGORY_NAMES).some(
          (name) => name === category.name
        )
    )
    .map(categoryMapper.toDomainUserCategory);
};
