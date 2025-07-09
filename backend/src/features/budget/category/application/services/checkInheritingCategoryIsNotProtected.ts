import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import {
  AddingTransactionToProtectedCategoryError,
  UnableToFindProtectedCategoriesInDBError,
} from "../../category.errors";

export const checkInheritingCategoryIsNotProtected = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  categoryId: string,
) => {
  const protectedCategoryIds = await categoryRepository.getProtectedCategoryIds(
    prisma,
    userId,
  );

  if (protectedCategoryIds.length === 0)
    throw new UnableToFindProtectedCategoriesInDBError();

  const protectedIds = new Set(protectedCategoryIds);

  if (protectedIds.has(categoryId)) {
    throw new AddingTransactionToProtectedCategoryError();
  }
};
