import { Prisma } from "@prisma/client";
import {
  AddingCategoryToProtectedCategoryGroupError,
  UnableToFindProtectedCategoriesInDBError,
} from "../../categoryGroup.errors";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";

export const isProtectedCategoryGroup = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  categoryGroupId: string,
) => {
  const protectedCategoryGroupIds =
    await categoryGroupRepository.getProtectedCategoryGroupIds(prisma, userId);

  if (protectedCategoryGroupIds.length === 0)
    throw new UnableToFindProtectedCategoriesInDBError();

  const protectedGroupIds = new Set(protectedCategoryGroupIds);

  //TODO: THIS ERROR NEEDS A NAME CHANGE
  if (protectedGroupIds.has(categoryGroupId)) {
    throw new AddingCategoryToProtectedCategoryGroupError();
  }
};
