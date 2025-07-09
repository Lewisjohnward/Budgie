import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";

export const getNextCategoryPosition = async (
  prisma: Prisma.TransactionClient,
  categoryGroupId: string,
) => {
  const latest = await categoryRepository.getMaxCategoryPositionInGroup(
    prisma,
    categoryGroupId,
  );

  return latest !== null ? latest + 1 : 0;
};
