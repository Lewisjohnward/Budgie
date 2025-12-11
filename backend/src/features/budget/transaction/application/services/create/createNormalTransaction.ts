import { Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import {
  NormalTransactionEntity,
  NormalTransactionCreateData,
} from "../../../transaction.types";

/**
 * Creates a **normal (non-transfer)** transaction.
 *
 * Normal transactions:
 * - Always belong to a category
 * - Do not reference another transaction
 * - Represent income or expense on a single account
 *
 * Runs inside an existing Prisma transaction.
 *
 * @param tx - Prisma transaction client used for atomic writes
 * @param normalTransactionData - Validated normal transaction data
 * @returns The created normal transaction persisted in the database
 */

export async function createNormalTransaction(
  tx: Prisma.TransactionClient,
  normalTransactionData: NormalTransactionCreateData
): Promise<NormalTransactionEntity> {
  const newTransaction = await transactionRepository.createTransaction(
    tx,
    normalTransactionData
  );

  return newTransaction as NormalTransactionEntity;
}
