import { Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import {
  NormalTransactionEntity,
  TransferTransactionEntity,
} from "../../transaction.types";
import {
  MissingTransferPairIdError,
  TransactionsNotFoundError,
  TransferPairNotFoundError,
} from "../../transaction.errors";

/**
 * Retrieves a set of transactions by ID, validates ownership and transfer integrity,
 * and returns normal transactions alongside all related transfer transactions
 * (including their paired rows).
 *
 * This function guarantees that:
 * - All requested transaction IDs exist and are owned by the given user
 * - Any requested transfer transaction:
 *   - has a non-null `transferTransactionId`
 *   - has a corresponding paired transfer transaction present in the fetched results
 *
 * The returned transfer transactions are therefore safe to operate on as a
 * consistent, complete transfer set.
 *
 * Behaviour:
 * 1. Fetches the requested transactions and any associated transfer pair transactions
 *    in a single query.
 * 2. Validates that *all* requested transaction IDs were found and belong to the user.
 * 3. Separates requested transactions into:
 *    - normal transactions
 *    - transfer transactions
 * 4. Enforces transfer invariants on the requested transfer transactions.
 * 5. Returns:
 *    - the requested normal transactions
 *    - all related transfer transactions (requested + their pairs)
 *
 * @param {Prisma.TransactionClient} tx
 *        Prisma transaction client. All database operations are executed within
 *        this transaction scope.
 * @param {string} userId
 *        ID of the user requesting the transactions. Used for ownership validation.
 * @param {string[]} transactionIds
 *        Transaction IDs explicitly requested by the caller.
 *
 * @returns {Promise<{
 *   normalTransactions: NormalTransactionEntity[];
 *   allTransferTransactions: TransferTransactionEntity[];
 * }>}
 * An object containing:
 * - `normalTransactions`:
 *   Requested transactions that are not transfers.
 * - `allTransferTransactions`:
 *   All transfer transactions related to the request, including both the
 *   requested transfer transactions and their paired transfer rows.
 *
 * @throws {TransactionsNotFoundError}
 * Thrown if any of the requested transaction IDs do not exist or are not owned
 * by the user.
 *
 * @throws {MissingTransferPairIdError}
 * Thrown if a requested transfer transaction has a null `transferTransactionId`.
 *
 * @throws {TransferPairNotFoundError}
 * Thrown if a requested transfer transaction references a pair transaction
 * that is not present in the fetched results.
 *
 * @example
 * const { normalTransactions, allTransferTransactions } =
 *   await getTransactionsWithPairs(
 *     tx,
 *     userId,
 *     ["tx-1", "tx-2", "tx-3"]
 *   );
 */

type TransactionsWithPairsResult = {
  normalTransactions: NormalTransactionEntity[];
  allTransferTransactions: TransferTransactionEntity[];
};

export const getTransactionsWithPairs = async (
  tx: Prisma.TransactionClient,
  userId: string,
  transactionIds: string[]
): Promise<TransactionsWithPairsResult> => {
  const allTransactions =
    await transactionRepository.getTransactionsByIdWithPairs(
      tx,
      transactionIds,
      userId
    );

  // Filter to only the originally requested transactions for validation
  const requestedTransactions = allTransactions.filter((tx) =>
    transactionIds.includes(tx.id)
  );

  // If the transactionIds are not all owned by user
  if (requestedTransactions.length !== transactionIds.length) {
    throw new TransactionsNotFoundError();
  }

  // Filter the transfer transactions
  const requestedTransferTransactions = requestedTransactions.filter(
    (tx): tx is TransferTransactionEntity =>
      tx.transferAccountId !== null && tx.categoryId === null
  );

  // Check that no transfer transaction has transferTransactionId === null
  const missingPair = requestedTransferTransactions.find(
    (t) => t.transferTransactionId === null
  );

  if (missingPair) {
    throw new MissingTransferPairIdError({
      transactionId: missingPair.id,
      userId,
    });
  }

  // Check that the transferTransactionId corresponds to a transaction in allIds
  const allIds = new Set(allTransactions.map((t) => t.id));

  const missingPairRow = requestedTransferTransactions.find(
    (t) => !allIds.has(t.transferTransactionId!)
  );

  if (missingPairRow) {
    throw new TransferPairNotFoundError({
      transactionId: missingPairRow.id,
      transferTransactionId: missingPairRow.transferTransactionId,
      userId,
    });
  }

  const normalTransactions = requestedTransactions.filter(
    (tx): tx is NormalTransactionEntity =>
      tx.transferAccountId === null && tx.categoryId !== null
  );

  // Extract all transfer transactions (requested + their pairs)
  // Pairs are transactions where transferTransactionId is in the requested IDs
  const allTransferTransactions = allTransactions.filter(
    (tx): tx is TransferTransactionEntity =>
      tx.transferAccountId !== null &&
      tx.categoryId === null &&
      (transactionIds.includes(tx.id) ||
        (tx.transferTransactionId !== null &&
          transactionIds.includes(tx.transferTransactionId)))
  ) as TransferTransactionEntity[];

  return {
    normalTransactions,
    allTransferTransactions,
  };
};
