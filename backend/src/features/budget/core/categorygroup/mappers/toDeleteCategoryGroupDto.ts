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
    deletedCategoryGroupId: result.deletedCategoryGroupId,
    deletedCategoryIds: result.deletedCategoryIds,

    transactionReassignments: Object.fromEntries(
      result.updatedTransactions.map((tx) => [tx.id, tx.categoryId])
    ),

    monthUpdates: Object.fromEntries(
      Object.entries(result.updatedMonths).map(([monthId, value]) => [
        monthId,
        {
          activity: value.activity.toNumber(),
          assigned: value.assigned.toNumber(),
        },
      ])
    ),
  };
};
