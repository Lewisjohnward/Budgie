import { Prisma } from "@prisma/client";
import { NoCategoryGroupFoundError } from "../../categoryGroup.errors";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";

export const ensureUserOwnsCategoryGroup = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  categoryGroupId: string,
) => {
  const id = await categoryGroupRepository.getCategoryGroupId(
    prisma,
    userId,
    categoryGroupId,
  );

  if (!id) {
    throw new NoCategoryGroupFoundError();
  }
};
