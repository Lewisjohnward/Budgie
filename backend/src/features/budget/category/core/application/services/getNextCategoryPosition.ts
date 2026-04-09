import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { type CategoryGroupId } from "../../../../categorygroup/categoryGroup.types";

type NextCategoryPosition = number;

export const getNextCategoryPosition = async (
  prisma: Prisma.TransactionClient,
  categoryGroupId: CategoryGroupId
): Promise<NextCategoryPosition> => {
  const latest = await categoryRepository.getMaxCategoryPositionInGroup(
    prisma,
    categoryGroupId
  );

  return latest !== null ? latest + 1 : 0;
};
