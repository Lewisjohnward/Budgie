/**
 * Creates the **source side** of a transfer transaction.
 *
 * This represents the transaction on the account money is moving **from**.
 * The corresponding destination transaction will be created separately and
 * linked via `transferTransactionId`.
 *
 * Invariants:
 * - `categoryId` must be `null`
 * - `transferTransactionId` must be `undefined` (will be generated)
 *
 * Runs inside an existing Prisma transaction.
 *
 * @param tx - Prisma transaction client used for atomic writes
 * @param sourceTransactionData - Validated transfer source transaction data
 * @returns The created transfer transaction persisted in the database
 */

import { Prisma } from "@prisma/client";
import {
  TransferDestinationCreateData,
  TransferSourceCreateData,
} from "../../../transaction.schema";
import { TransferTransactionEntity } from "../../../transaction.types";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";

export async function createTransferSourceTransaction(
  tx: Prisma.TransactionClient,
  sourceTransactionData: TransferSourceCreateData
): Promise<TransferTransactionEntity> {
  const newTransaction = await transactionRepository.createTransaction(
    tx,
    sourceTransactionData
  );
  return newTransaction as TransferTransactionEntity;
}

/**
 * Creates the **destination side** of a transfer transaction.
 *
 * This represents the transaction on the account money is moving **to**.
 * It must reference the source transaction via `transferTransactionId`.
 *
 * Invariants:
 * - `categoryId` must be `null`
 * - `transferTransactionId` must be provided and valid
 *
 * Runs inside an existing Prisma transaction.
 *
 * @param tx - Prisma transaction client used for atomic writes
 * @param destinationTransactionData - Validated transfer destination transaction data
 * @returns The created transfer transaction persisted in the database
 */

export async function createTransferDestinationTransaction(
  tx: Prisma.TransactionClient,
  destinationTransactionData: TransferDestinationCreateData
): Promise<TransferTransactionEntity> {
  const newTransaction = await transactionRepository.createTransaction(
    tx,
    destinationTransactionData
  );
  return newTransaction as TransferTransactionEntity;
}
