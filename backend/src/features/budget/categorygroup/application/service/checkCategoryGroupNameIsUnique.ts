import { Prisma } from "@prisma/client";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { DuplicateCategoryGroupNameError } from "../../categoryGroup.errors";

export const checkCategoryGroupNameIsUnique = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  name: string,
) => {
  const existingCategory =
    await categoryGroupRepository.getCategoryGroupIdByName(
      prisma,
      userId,
      name,
    );

  if (existingCategory) {
    throw new DuplicateCategoryGroupNameError();
  }
};
