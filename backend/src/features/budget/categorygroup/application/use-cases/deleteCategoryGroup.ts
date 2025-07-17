import { prisma } from "../../../../../shared/prisma/client";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { CategoryGroupNotFoundError } from "../../categoryGroup.errors";
import { DeleteCategoryGroupPayload } from "../../categorygroup.schema";
import { categoryGroupService } from "../../categoryGroup.service";

export const deleteCategoryGroup = async (
  payload: DeleteCategoryGroupPayload,
) => {
  const { userId, categoryGroupId, inheritingCategoryId } = payload;
  await prisma.$transaction(async (tx) => {
    const categoryGroupToDelete =
      await categoryGroupRepository.getCategoryGroup(
        tx,
        userId,
        categoryGroupId,
      );

    if (!categoryGroupToDelete) {
      throw new CategoryGroupNotFoundError();
    }

    await categoryGroupService.isProtectedCategoryGroup(
      tx,
      userId,
      categoryGroupId,
    );

    // get transactions by categoryGroup Id

    // if no transactions, delete category group, delete categories, delete months

    // if transactions, delete category group, delete categories, delete months, move transactions to new category, update months for inherting category
  });
};
