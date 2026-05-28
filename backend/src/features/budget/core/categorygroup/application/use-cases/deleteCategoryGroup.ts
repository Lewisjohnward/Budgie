import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { prisma } from "../../../../../../shared/prisma/client";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { categoryService } from "../../../category/core/category.service";
import {
  asCategoryId,
  DomainMonth,
  type CategoryId,
} from "../../../category/core/category.types";
import { transactionService } from "../../../transaction/transaction.service";
import { type DomainNormalTransaction } from "../../../transaction/transaction.types";
import { type DeleteCategoryGroupResult } from "../../categoryGroup.contract";
import {
  InheritingCategoryBelongsToDeletedGroupError,
  InheritingCategoryRequiredError,
} from "../../categoryGroup.errors";
import { type DeleteCategoryGroupPayload } from "../../categorygroup.schema";
import { categoryGroupService } from "../../categoryGroup.service";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../categoryGroup.types";

/**
 * Command object used internally to delete a category group.
 *
 * It normalizes raw payload values into strongly-typed domain identifiers
 * (`CategoryGroupId`, `CategoryId`) before executing the use case.
 */
export type DeleteCategoryGroupCommand = Omit<
  DeleteCategoryGroupPayload,
  "userId" | "categoryGroupId" | "inheritingCategoryId"
> & {
  userId: UserId;
  categoryGroupId: CategoryGroupId;
  inheritingCategoryId?: CategoryId;
};

/**
 * Transforms a raw `DeleteCategoryGroupPayload` into a
 * `DeleteCategoryGroupCommand` by converting primitive IDs
 * into domain-specific value objects.
 *
 * @param {DeleteCategoryGroupPayload} p - Raw payload received from the application layer.
 * @returns {DeleteCategoryGroupCommand} A normalized command with typed identifiers.
 */
export const toDeleteCategoryGroupCommand = (
  p: DeleteCategoryGroupPayload
): DeleteCategoryGroupCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryGroupId: asCategoryGroupId(p.categoryGroupId),
  inheritingCategoryId: p.inheritingCategoryId
    ? asCategoryId(p.inheritingCategoryId)
    : undefined,
});

/**
 * Deletes a category group within a transactional boundary.
 *
 * Business rules:
 * - Ensures the category group exists for the given user.
 * - Prevents deletion of protected category groups.
 * - If no transactions are associated with the group,
 *   the group (and related aggregates such as categories and months)
 *   is deleted directly.
 * - If transactions exist, they must be reassigned to an inheriting
 *   category before completing the deletion (logic pending).
 *
 * The operation runs inside a Prisma transaction to guarantee
 * atomicity and
 * consistency across all related writes (category groups, categories,
 * transactions, and derived monthly data).
 *
 * @async
 * @function deleteCategoryGroup
 * @param {DeleteCategoryGroupPayload} payload - Raw input containing:
 * - `userId`: Owner of the category group.
 * - `categoryGroupId`: Identifier of the group to delete.
 * - `inheritingCategoryId` (optional): Target category that will inherit
 *   existing transactions if reassignment is required.
 *
 * @throws {CategoryGroupNotFoundError}
 * Thrown when the category group does not exist for the given user.
 *
 * @throws {Error}
 * Thrown if the category group is protected and cannot
 * be deleted (the underlying service is expected to throw a domain error).
 *
 * @returns {Promise<void>} Resolves when the delete operation completes.
 *
 * @example
 * await deleteCategoryGroup({
 *   userId,
 *   categoryGroupId: "cg_123",
 *   inheritingCategoryId: "cat_456",
 * });
 */
export const deleteCategoryGroup = async (
  payload: DeleteCategoryGroupPayload
): Promise<DeleteCategoryGroupResult> => {
  const { userId, categoryGroupId, inheritingCategoryId } =
    toDeleteCategoryGroupCommand(payload);

  return await prisma.$transaction(async (tx) => {
    // Get the category group to be deleted
    const categoryGroup = await categoryGroupService.getModifiableCategoryGroup(
      tx,
      userId,
      categoryGroupId
    );

    // Get categories belonging to the categoryGroup
    const categoryIds =
      await categoryService.categories.getCategoryIdsByCategoryGroupId(
        tx,
        categoryGroup.id
      );

    // Get transactions that belong to categories
    const transactions = await transactionService.getTransactionsByCategoryIds(
      tx,
      categoryIds
    );

    const hasTransactions = transactions.length > 0;
    let updatedMonths: DomainMonth[] = [];
    let updatedTransactions: DomainNormalTransaction[] = [];
    if (hasTransactions) {
      if (!inheritingCategoryId) {
        throw new InheritingCategoryRequiredError();
      }

      const newCategory =
        await categoryService.categories.getModifiableCategory(
          tx,
          userId,
          inheritingCategoryId
        );

      if (newCategory.categoryGroupId === categoryGroupId)
        throw new InheritingCategoryBelongsToDeletedGroupError();

      updatedTransactions = transactions.map((tx) => ({
        ...tx,
        categoryId: newCategory.id,
      }));

      // Calculate months for the inheriting category
      updatedMonths =
        await categoryService.months.recalculateCategoryMonthsForTransactions(
          tx,
          updatedTransactions,
          OperationMode.Add
        );

      // if transactions, delete category group, delete categories, delete months, move transactions to new category, update months for inherting category
      await transactionRepository.bulkUpdateTransactionCategory(
        tx,
        categoryIds,
        inheritingCategoryId
      );
    }

    // fix ordering
    await categoryGroupRepository.shiftAfterDelete(
      tx,
      userId,
      categoryGroup.position
    );

    // Delete category group
    await categoryGroupRepository.deleteCategoryGroup(tx, categoryGroup.id);

    return {
      deletedCategoryGroupId: categoryGroup.id,

      deletedCategoryIds: categoryIds,

      updatedTransactions,

      updatedMonths,
    };
  });
};
