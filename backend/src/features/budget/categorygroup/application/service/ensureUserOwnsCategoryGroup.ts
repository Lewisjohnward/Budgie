import { Prisma } from "@prisma/client";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { NoCategoryGroupFoundError } from "../../categoryGroup.errors";

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
