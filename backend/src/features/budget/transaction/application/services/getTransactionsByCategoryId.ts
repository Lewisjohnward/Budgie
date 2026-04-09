import { type Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { type CategoryId } from "../../../category/core/category.types";
import { transactionMapper } from "../../transaction.mapper";
import { type DomainNormalTransaction } from "../../transaction.types";

/**
 * @name getTransactionsByCategoryId
 * @description Retrieves all transactions associated with a specific category ID.
 * @param {Prisma.TransactionClient} tx - The Prisma transaction client.
 * @param {CategoryId} categoryId - The ID of the category to retrieve transactions for.
 * @returns {Promise<DomainNormalTransaction[]>} A promise that resolves to an array of normal domain transactions.
 */
export const getTransactionsByCategoryId = async (
  tx: Prisma.TransactionClient,
  categoryId: CategoryId
): Promise<DomainNormalTransaction[]> => {
  const transactions =
    await transactionRepository.getTransactionsByCategoryId(tx, categoryId);

  return transactions.map(transactionMapper.toDomainNormalTransaction);
};
