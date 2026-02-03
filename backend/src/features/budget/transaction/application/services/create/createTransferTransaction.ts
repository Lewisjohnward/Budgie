import { Prisma } from "@prisma/client";
import {
  type TransferDestinationCreateData,
  type TransferSourceCreateData,
} from "../../../transaction.schema";
import {
  type DomainTransaction,
  type DomainTransferSourceTransaction,
} from "../../../transaction.types";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import { transactionMapper } from "../../../transaction.mapper";
import { TransferDestinationMissingPairIdError } from "../../../transaction.errors";

/**
 * Creates the **source side** of a transfer transaction.
 *
 * The source transaction represents the money moving **out** of `accountId`
 * toward the destination account (`transferAccountId`).
 *
 * Domain invariants enforced:
 * - `categoryId` is always `null` (transfers do not belong to categories).
 * - `transferTransactionId` is `null`/`undefined` at creation, since the paired
 *   destination transaction does not yet exist.
 *
 * This function executes inside a Prisma transaction to ensure atomicity.
 *
 * @param tx - Prisma transaction client used for atomic database writes.
 * @param sourceTransactionData - Validated input data for creating the source transfer.
 *
 * @returns A promise that resolves to the newly created `DomainTransferSourceTransaction`,
 *          mapped to the domain model.
 */
export async function createTransferSourceTransaction(
  tx: Prisma.TransactionClient,
  sourceTransactionData: TransferSourceCreateData
): Promise<DomainTransferSourceTransaction> {
  const createData = {
    ...sourceTransactionData,
    categoryId: null,
    transferTransactionId: null,
  };

  const row = await transactionRepository.createTransaction(tx, createData);

  return transactionMapper.toDomainTransferSourceTransaction(row);
}

/**
 * Creates the **destination side** of a transfer transaction.
 *
 * The destination transaction represents the money arriving at the target account
 * (`accountId` of the destination). It must reference the source transaction
 * via `transferTransactionId`.
 *
 * Domain invariants enforced:
 * - `categoryId` must be `null` (transfers do not belong to categories).
 * - `transferTransactionId` must be provided and valid.
 *
 * This function executes inside a Prisma transaction to ensure atomicity.
 *
 * @param tx - Prisma transaction client used for atomic database writes.
 * @param destinationTransactionData - Validated input data for creating the destination transfer.
 *
 * @returns A promise that resolves to the newly created `DomainTransaction`,
 *          mapped to the domain model.
 *
 * @throws {Error} If `transferTransactionId` is missing, indicating a violation
 *                 of the transfer invariant.
 */
export async function createTransferDestinationTransaction(
  tx: Prisma.TransactionClient,
  destinationTransactionData: TransferDestinationCreateData
): Promise<DomainTransaction> {
  const createData = {
    ...destinationTransactionData,
    categoryId: null,
  };

  if (!createData.transferTransactionId) {
    throw new TransferDestinationMissingPairIdError();
  }

  const row = await transactionRepository.createTransaction(tx, createData);

  return transactionMapper.toDomainTransaction(row);
}
