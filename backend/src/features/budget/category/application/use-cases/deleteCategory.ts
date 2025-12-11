import { prisma } from "../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { CategoryNotFoundError } from "../../category.errors";
import { DeleteCategoryPayload } from "../../category.schema";
import { InheritingCategoryIdNotProvidedError } from "../../category.errors";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { categoryService } from "../../category.service";
import { transactionUseCase } from "../../../transaction/transaction.useCase";

export const deleteCategory = async ({
  userId,
  categoryId,
  inheritingCategoryId,
}: DeleteCategoryPayload) => {
  await prisma.$transaction(async (tx) => {
    const categoryToDelete = await categoryRepository.getCategory(
      tx,
      userId,
      categoryId,
    );

    if (!categoryToDelete) {
      throw new CategoryNotFoundError();
    }

    await categoryService.categories.isCategoryProtected(
      tx,
      userId,
      categoryToDelete.id,
    );

    const transactions =
      await transactionRepository.getTransactionsByCategoryId(tx, categoryId);

    const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

    if (transactions.length === 0) {
      await categoryRepository.deleteMonthsByCategoryId(tx, categoryId);

      await categoryRepository.deleteCategory(tx, categoryId);

      await categoryService.rta.calculateMonthsAvailable(
        tx,
        userId,
        rtaCategoryId,
      );
    } else {
      if (!inheritingCategoryId) {
        throw new InheritingCategoryIdNotProvidedError();
      }
      await categoryService.categories.checkUserOwnsCategory(
        tx,
        userId,
        inheritingCategoryId,
      );

      await categoryService.categories.isCategoryProtected(
        tx,
        userId,
        inheritingCategoryId,
      );

      const uncategorisedTransactionId =
        await categoryRepository.getUncategorisedCategoryId(tx, userId);

      const updatedTransactions = transactions.map((t) => ({
        ...t,
        categoryId: uncategorisedTransactionId,
      }));

      //TODO: NEED TO PASS TX update transaction needs to go into service
      await transactionUseCase.updateTransactions({
        userId,
        transactions: updatedTransactions,
      });

      await categoryRepository.deleteMonthsByCategoryId(tx, categoryId);

      await categoryRepository.deleteCategory(tx, categoryId);
    }
  });
};
