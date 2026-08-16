import { type DeleteCategoryGroupResult } from "../categoryGroup.contract";
import { type DeleteCategoryGroupDto } from "../categoryGroup.types";

/**
 * Converts the domain-level delete category group result into a JSON-safe DTO
 * suitable for API responses.
 *
 * This function:
 * - Converts branded IDs into plain strings
 * - Converts transaction reassignment arrays into key-value maps
 * - Converts Prisma Decimal values into numbers
 *
 * @param result - Domain result returned from the delete category group use case
 * @returns A serialized DTO ready to be sent in an HTTP response
 */

export const toDeleteCategoryGroupDto = (
  result: DeleteCategoryGroupResult
): DeleteCategoryGroupDto => {
  return {
    deleted: {
      categoryGroup: {
        id: result.deletedCategoryGroup.id,
        name: result.deletedCategoryGroup.name,
        position: result.deletedCategoryGroup.position,
      },

      categories: Object.fromEntries(
        result.deletedCategories.map((category) => [
          category.id,
          {
            id: category.id,
            name: category.name,
            categoryGroupId: category.categoryGroupId,
            position: category.position,
          },
        ])
      ),

      months: Object.fromEntries(
        result.deletedMonths.map((month) => [
          month.id,
          {
            id: month.id,
            categoryId: month.categoryId,
            month: month.month.toISOString(),
            activity: month.activity.toNumber?.() ?? month.activity,
            assigned: month.assigned.toNumber?.() ?? month.assigned,
            available: month.available.toNumber?.() ?? month.available,
          },
        ])
      ),
    },

    updated: {
      categoryGroups: result.updatedCategoryGroups.map((group) => ({
        id: group.id,
        position: group.position,
      })),
      transactions: Object.fromEntries(
        result.updatedTransactions.map((transaction) => [
          transaction.id,
          {
            type: transaction.type,
            id: transaction.id,
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            payeeId: transaction.payeeId as string,
            inflow: transaction.inflow.toNumber(),
            outflow: transaction.outflow.toNumber(),
            date: transaction.date.toISOString(),
            memo: transaction.memo,
          },
        ])
      ),

      months: Object.fromEntries(
        result.updatedMonths.map((month) => [
          month.id,
          {
            id: month.id,
            categoryId: month.categoryId,
            month: month.month.toISOString(),
            activity: month.activity.toNumber?.() ?? month.activity,
            assigned: month.assigned.toNumber?.() ?? month.assigned,
            available: month.available.toNumber?.() ?? month.available,
          },
        ])
      ),
    },
  };
};
