import { Prisma } from "@prisma/client";
import { type CategoryId, type DomainCategory } from "../../category.types";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../category.mapper";
import { isUniqueViolation } from "../../../../../../../shared/prisma/utils/isUniqueViolation";
import { DuplicateCategoryNameError } from "../../category.errors";

export const renameCategory = async (
  tx: Prisma.TransactionClient,
  categoryId: CategoryId,
  name: string
): Promise<DomainCategory> => {
  try {
    const categoryRaw = await categoryRepository.renameCategory(
      tx,
      categoryId,
      name
    );
    return categoryMapper.toDomainCategory(categoryRaw);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateCategoryNameError();
    }
    throw error;
  }
};
