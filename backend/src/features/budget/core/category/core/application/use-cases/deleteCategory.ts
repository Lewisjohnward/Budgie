import { prisma } from "../../../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { InheritingCategoryIdNotProvidedError } from "../../category.errors";
import { type DeleteCategoryPayload } from "../../category.schema";
import { categoryService } from "../../category.service";
import {
  asCategoryId,
  DomainMonth,
  type CategoryId,
} from "../../category.types";
import { transactionService } from "../../../../transaction/transaction.service";
import { asUserId, type UserId } from "../../../../../../user/auth/auth.types";
import { type DeleteCategoryResult } from "../../category.contract";
import { transactionRepository } from "../../../../../../../shared/repository/transactionRepositoryImpl";
import { OperationMode } from "../../../../../../../shared/enums/operation-mode";
import { type DomainNormalTransaction } from "../../../../transaction/transaction.types";
import { categoryMapper } from "../../category.mapper";

export type DeleteCategoryCommand = Omit<
  DeleteCategoryPayload,
  "userId" | "categoryId" | "inheritingCategoryId"
> & {
  userId: UserId;
  categoryId: CategoryId;
  inheritingCategoryId?: CategoryId;
};

const toDeleteCategoryCommand = (
  p: DeleteCategoryPayload
): DeleteCategoryCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryId: asCategoryId(p.categoryId),
  inheritingCategoryId: p.inheritingCategoryId
    ? asCategoryId(p.inheritingCategoryId)
    : undefined,
});

/**
 * Deletes a category owned by a user, handling dependent data and enforcing
 * domain constraints.
 *
 * This operation executes within a single database transaction and performs:
 *
 * - Verification that the category exists and belongs to the user.
 * - Protection checks to prevent deletion of protected categories.
 * - Retrieval of all transactions assigned to the category.
 *
 * Deletion behavior depends on whether the category has transactions:
 *
 * 1. If no transactions exist:
 *    - All associated month records are deleted.
 *    - The category is removed.
 *    - "Ready to Assign" month availability is recalculated.
 *
 * 2. If transactions exist:
 *    - An `inheritingCategoryId` must be provided.
 *    - The inheriting category must exist, belong to the user,
 *      and not be protected.
 *    - Transactions are reassigned (via bulk operation) before deletion.
 *    - Associated month records are deleted.
 *    - The category is removed.
 *
 * This ensures referential integrity and prevents accidental data loss.
 *
 * @param payload - Raw delete payload containing the user identifier,
 * category identifier, and optional inheriting category identifier.
 *
 * @throws {CategoryNotFoundError} If the category does not exist or
 * does not belong to the user.
 * @throws {InheritingCategoryIdNotProvidedError} If the category contains
 * transactions but no inheriting category is supplied.
 * @throws {Error} If attempting to delete or reassign into a protected category.
 *
 * @returns A promise that resolves when the deletion process completes successfully.
 */
export const deleteCategory = async (
  payload: DeleteCategoryPayload
): Promise<DeleteCategoryResult> => {
  const { userId, categoryId, inheritingCategoryId } =
    toDeleteCategoryCommand(payload);

  return prisma.$transaction(async (tx) => {
    const category = await categoryService.categories.getModifiableCategory(
      tx,
      userId,
      categoryId
    );

    const transactions = await transactionService.getTransactionsByCategoryIds(
      tx,
      [category.id]
    );

    const rtaCategoryId = await categoryService.rta.getRtaCategoryId(
      tx,
      userId
    );

    const deletedMonths = await categoryService.months.getMonthsForCategories(
      tx,
      [categoryId]
    );

    let updatedTransactions: DomainNormalTransaction[] = [];
    let updatedMonths: DomainMonth[] = [];

    if (transactions.length > 0) {
      if (!inheritingCategoryId) {
        throw new InheritingCategoryIdNotProvidedError();
      }

      const inheritingCategory =
        await categoryService.categories.getModifiableCategory(
          tx,
          userId,
          inheritingCategoryId
        );

      await transactionRepository.bulkUpdateCategoryId(
        tx,
        transactions.map((t) => t.id),
        inheritingCategory.id
      );

      updatedTransactions = transactions.map((transaction) => ({
        ...transaction,
        categoryId: inheritingCategory.id,
      }));

      updatedMonths =
        await categoryService.months.recalculateCategoryMonthsForTransactions(
          tx,
          updatedTransactions,
          OperationMode.Add
        );
    }

    await categoryRepository.deleteMonthsByCategoryId(tx, category.id);

    await categoryRepository.shiftCategoriesAfterDelete(
      tx,
      userId,
      category.categoryGroupId,
      category.position
    );

    await categoryRepository.deleteCategory(tx, category.id);

    const updatedRtaMonths = await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId
    );

    const updatedCategories = (
      await tx.category.findMany({
        where: {
          userId,
          categoryGroupId: category.categoryGroupId,
        },
        orderBy: {
          position: "asc",
        },
      })
    ).map(categoryMapper.toDomainCategory);

    return {
      deletedCategory: category,
      deletedMonths,
      updatedCategories,
      updatedMonths: [...updatedMonths, ...updatedRtaMonths],
      updatedTransactions,
    };
  });
};

// categoryService.transactions.reassignCategory(...)
