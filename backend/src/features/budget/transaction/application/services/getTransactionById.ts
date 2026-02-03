import { type Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import {
  type TransactionId,
  type DomainTransaction,
} from "../../transaction.types";
import { NoTransactionsFoundError } from "../../transaction.errors";
import { transactionMapper } from "../../transaction.mapper";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Fetches a single transaction by ID, enforcing user ownership, and maps it to a domain type.
 *
 * Responsibilities:
 * - Delegates to the repository to look up the transaction row.
 * - Throws immediately if the row does not exist or is not owned by the user.
 * - Maps the raw DB row to a `DomainTransaction` via `toDomainTransaction`.
 *
 * Notes:
 * - Returns a discriminated `DomainTransaction` (`"normal" | "transfer"`).
 * - Intended as a reusable building block for any workflow that needs a
 *   guaranteed-existing, domain-mapped transaction before proceeding.
 *
 * @param tx - Prisma transaction client used for the database read.
 * @param userId - ID of the user performing the operation (ownership enforced via account).
 * @param transactionId - ID of the transaction to fetch.
 * @returns The domain-mapped transaction.
 *
 * @throws {NoTransactionsFoundError}
 * Thrown if the transaction does not exist or is not owned by the user.
 */
export const getTransactionById = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  transactionId: TransactionId
): Promise<DomainTransaction> => {
  const row = await transactionRepository.getTransactionById(
    tx,
    userId,
    transactionId
  );
  if (!row) throw new NoTransactionsFoundError();
  return transactionMapper.toDomainTransaction(row);
};
