import { categoryRepository } from "../../../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../../category.mapper";
import { type DomainMonth } from "../../../category.types";
import { type UserId } from "../../../../../../../user/auth/auth.types";

export const getMonths = async (
  userId: UserId,
  range: { from?: Date; to?: Date }
): Promise<DomainMonth[]> => {
  const rawMonths = await categoryRepository.getMonths(userId, range);

  return rawMonths.map(categoryMapper.toDomainMonth);
};
