import { Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import {
  type NormalTransactionCreateData,
  type DomainNormalTransaction,
} from "../../../transaction.types";
import { transactionMapper } from "../../../transaction.mapper";

/**
 * Creates a normal (non-transfer) transaction for a specific account.
 *
 * Characteristics of a normal transaction:
 * - Must belong to a category.
 * - Cannot reference another transaction (not a transfer).
 * - Represents an income or expense entry for a single account.
 *
 * This function executes all operations inside the provided Prisma transaction
 * to ensure atomicity.
 *
 * @param tx - Prisma transaction client used to perform atomic database writes.
 * @param normalTransactionData - Validated input data for creating the transaction,
 *                                including account, category, amounts, and optional memo/payee.
 *
 * @returns A promise that resolves to the newly created `DomainNormalTransaction`,
 *          mapped to the domain model.
 *
 * @throws Will throw an error if the transaction creation fails due to database
 *         constraints or invalid data.
 */
export async function createNormalTransaction(
  tx: Prisma.TransactionClient,
  normalTransactionData: NormalTransactionCreateData
): Promise<DomainNormalTransaction> {
  const row = await transactionRepository.createTransaction(
    tx,
    normalTransactionData
  );

  const normTx = transactionMapper.toDomainNormalTransaction(row);

  return normTx;
}
