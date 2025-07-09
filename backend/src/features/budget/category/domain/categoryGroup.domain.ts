import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../shared/repository/categoryRepositoryImpl";
import {
  AddingTransactionToProtectedCategoryGroupError,
  UnableToFindProtectedCategoriesInDBError,
} from "../category.errors";

export const ensureUserNotAddingToProtectedCategoryGroups = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  categoryGroupId: string,
) => {
  const protectedCategoryGroupIds =
    await categoryRepository.getProtectedCategoryGroupIds(prisma, userId);

  if (protectedCategoryGroupIds.length === 0)
    throw new UnableToFindProtectedCategoriesInDBError();

  const protectedGroupIds = new Set(protectedCategoryGroupIds);

  if (protectedGroupIds.has(categoryGroupId)) {
    throw new AddingTransactionToProtectedCategoryGroupError();
  }
};

export const ensureUserOwnsCategoryGroup = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  id: string,
) => {
  const categoryGroupId = await categoryRepository.getCategoryGroupId(
    prisma,
    userId,
    id,
  );

  if (!categoryGroupId) {
    throw new AddingTransactionToProtectedCategoryGroupError();
  }
};
