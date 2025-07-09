import { Prisma } from "@prisma/client";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import {
  AddingCategoryToProtectedCategoryGroupError,
  UnableToFindProtectedCategoriesInDBError,
} from "../../categoryGroup.errors";

export const ensureNotAddingToProtectedCategoryGroup = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  categoryGroupId: string,
) => {
  const protectedCategoryGroupIds =
    await categoryGroupRepository.getProtectedCategoryGroupIds(prisma, userId);

  if (protectedCategoryGroupIds.length === 0)
    throw new UnableToFindProtectedCategoriesInDBError();

  const protectedGroupIds = new Set(protectedCategoryGroupIds);

  if (protectedGroupIds.has(categoryGroupId)) {
    throw new AddingCategoryToProtectedCategoryGroupError();
  }
};
