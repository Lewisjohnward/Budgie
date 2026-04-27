import { type DomainCategory } from "../../category.types";
import { categoryMapper } from "../../category.mapper";
import { type UserId } from "../../../../../../user/auth/auth.types";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";

export const getCategories = async (
  userId: UserId
): Promise<DomainCategory[]> => {
  const rawCategorys = await categoryRepository.getCategories(userId);

  return rawCategorys.map(categoryMapper.toDomainCategory);
};
