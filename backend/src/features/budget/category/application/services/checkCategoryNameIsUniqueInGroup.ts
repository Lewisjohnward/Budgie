import { Prisma } from "@prisma/client";
import { DuplicateCategoryNameError } from "../../category.errors";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";

export const checkCategoryNameIsUniqueInGroup = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  categoryGroupId: string,
  name: string,
) => {
  const existingCategory = await categoryRepository.getCategoryIdByGroupAndName(
    prisma,
    userId,
    categoryGroupId,
    name,
  );

  if (existingCategory) {
    throw new DuplicateCategoryNameError();
  }
};
