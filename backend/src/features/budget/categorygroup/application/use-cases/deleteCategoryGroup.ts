import { prisma } from "../../../../../shared/prisma/client";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
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

    const transactions =
      await transactionRepository.getTransactionsByCategoryId(
        tx,
        categoryGroupToDelete.id,
      );

    if (transactions.length === 0) {
      // if no transactions, delete category group, delete categories, delete months
      await categoryGroupRepository.deleteCategoryGroup(
        tx,
        categoryGroupToDelete.id,
      );
    }

    // if transactions, delete category group, delete categories, delete months, move transactions to new category, update months for inherting category
  });
};
