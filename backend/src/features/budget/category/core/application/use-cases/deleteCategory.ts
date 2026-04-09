import { prisma } from "../../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import {
  CategoryNotFoundError,
  InheritingCategoryIdNotProvidedError,
} from "../../category.errors";
import { type DeleteCategoryPayload } from "../../category.schema";
import { categoryService } from "../../category.service";
import { asCategoryId, type CategoryId } from "../../category.types";
import { transactionService } from "../../../../transaction/transaction.service";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";

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
): Promise<void> => {
  const { userId, categoryId, inheritingCategoryId } =
    toDeleteCategoryCommand(payload);

  await prisma.$transaction(async (tx) => {
    const categoryToDelete = await categoryService.categories.getCategory(
      tx,
      userId,
      categoryId
    );

    if (!categoryToDelete) {
      throw new CategoryNotFoundError();
    }

    await categoryService.categories.isCategoryProtected(
      tx,
      userId,
      categoryToDelete.id
    );

    const transactions = await transactionService.getTransactionsByCategoryId(
      tx,
      categoryId
    );

    const rtaCategoryId = await categoryService.rta.getRtaCategoryId(
      tx,
      userId
    );

    if (transactions.length === 0) {
      await categoryRepository.deleteMonthsByCategoryId(tx, categoryId);

      await categoryRepository.deleteCategory(tx, categoryId);

      await categoryService.rta.calculateMonthsAvailable(
        tx,
        userId,
        rtaCategoryId
      );
    } else {
      if (!inheritingCategoryId) {
        throw new InheritingCategoryIdNotProvidedError();
      }
      await categoryService.categories.getCategory(
        tx,
        userId,
        inheritingCategoryId
      );

      await categoryService.categories.isCategoryProtected(
        tx,
        userId,
        inheritingCategoryId
      );

      const uncategorisedCategoryId =
        await categoryService.categories.getUncategorisedCategoryId(tx, userId);

      await transactionService.bulk.applyCategoryChange(
        tx,
        userId,
        uncategorisedCategoryId,
        transactions
      );

      await categoryRepository.deleteMonthsByCategoryId(tx, categoryId);

      await categoryRepository.deleteCategory(tx, categoryId);
    }
  });
};
