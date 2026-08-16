import { transactionMapper } from "../../../transaction/transaction.mapper";
import { type TransactionNormalDto } from "../../../transaction/transaction.types";
import { type DeleteCategoryResult } from "../category.contract";
import { categoryMapper } from "../category.mapper";
import { type MonthDto } from "../category.types";
import {
  CategoryPositionPatch,
  type DeleteCategoryDto,
} from "../types/category.dto";

/**
 * Maps the domain result of a category deletion operation into a DTO suitable
 * for API responses and client-side state reconciliation.
 *
 * This function transforms the deleted category, deleted months, updated months,
 * and updated transactions from domain models into serializable DTOs expected
 * by the client.
 *
 * Collections are normalized into records keyed by entity ID to support
 * efficient client-side updates and cache synchronization without requiring
 * a full state refresh.
 *
 * @param result - The domain result produced by the category deletion use case.
 * @returns A DTO containing the entities that were deleted and updated as a
 * result of the operation.
 */

export const toDeleteCategoryDto = (
  result: DeleteCategoryResult
): DeleteCategoryDto => {
  const deletedMonths: Record<string, MonthDto> = Object.fromEntries(
    result.deletedMonths.map((m) => [m.id, categoryMapper.toMonthDto(m)])
  );

  const updatedMonths: Record<string, MonthDto> = Object.fromEntries(
    result.updatedMonths.map((m) => [m.id, categoryMapper.toMonthDto(m)])
  );

  const updatedTransactions: Record<string, TransactionNormalDto> =
    Object.fromEntries(
      result.updatedTransactions.map((t) => [
        t.id,
        transactionMapper.toTransactionNormalDto(t),
      ])
    );

  const patches: CategoryPositionPatch[] = result.updatedCategories.map(
    (category) => ({
      id: category.id,
      position: category.position,
      categoryGroupId: category.categoryGroupId,
    })
  );

  return {
    deleted: {
      category: categoryMapper.toCategoryUserDto(result.deletedCategory),
      months: deletedMonths,
    },
    updated: {
      categories: patches,
      months: updatedMonths,
      transactions: updatedTransactions,
    },
  };
};
