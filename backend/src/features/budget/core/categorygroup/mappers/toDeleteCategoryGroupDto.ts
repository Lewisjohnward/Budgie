import { DeleteCategoryGroupResult } from "../categoryGroup.contract";
import { DeleteCategoryGroupDto } from "../categoryGroup.types";

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
      categoryGroupId: result.deletedCategoryGroupId,
    },
    updated: {
      transactions: Object.fromEntries(
        result.updatedTransactions.map((tx) => [
          tx.id,
          {
            type: tx.type,
            id: tx.id,
            accountId: tx.accountId,
            categoryId: tx.categoryId,
            payeeId: tx.payeeId ?? null,
            date: tx.date.toISOString(),
            memo: tx.memo,
            inflow: tx.inflow.toNumber(),
            outflow: tx.outflow.toNumber(),
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
