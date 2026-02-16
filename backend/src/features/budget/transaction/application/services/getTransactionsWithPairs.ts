import { Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import {
  type DomainNormalTransaction,
  type DomainTransferDestinationTransaction,
  type DomainTransferSourceTransaction,
  type DomainTransferTransaction,
  type TransactionId,
} from "../../transaction.types";
import {
  MissingTransferPairIdError,
  TransactionsNotFoundError,
  TransferPairNotFoundError,
} from "../../transaction.errors";
import { transactionMapper } from "../../transaction.mapper";
import { type UserId } from "../../../../user/auth/auth.types";

// TODO:(lewis 2026-02-10 14:23) this file needs a good look at, maybe a jsdoc rewrite too

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
  normalTransactions: DomainNormalTransaction[];
  allTransferTransactions: DomainTransferTransaction[];
};

export const getTransactionsWithPairs = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  transactionIds: TransactionId[]
): Promise<TransactionsWithPairsResult> => {
  const allRows = await transactionRepository.getTransactionsByIdWithPairs(
    tx,
    transactionIds,
    userId
  );

  // TODO:(lewis 2026-02-10 14:19) not at all keen on this
  const all = allRows.map(transactionMapper.toDomainAnyTransaction);

  // validate requested ids exist
  const requested = all.filter((t) => transactionIds.includes(t.id));

  if (requested.length !== transactionIds.length) {
    throw new TransactionsNotFoundError();
  }

  // requested transfers = those with categoryId === null

  // TODO:(lewis 2026-02-10 14:21) not keen on this, is it needed
  const requestedTransfers = requested.filter(
    (
      t
    ): t is
      | DomainTransferSourceTransaction
      | DomainTransferDestinationTransaction => t.type === "transfer"
  );

  // destination transfers must have transferTransactionId
  const missingPair = requestedTransfers.find(
    (t): t is DomainTransferSourceTransaction =>
      t.transferTransactionId === undefined
  );

  if (missingPair) {
    throw new MissingTransferPairIdError({
      transactionId: missingPair.id,
      userId,
    });
  }

  const allIdSet = new Set(all.map((t) => t.id));

  // TODO:(lewis 2026-02-10 14:24) is this okay?
  const missingPairRow = requestedTransfers.find(
    (t): t is DomainTransferDestinationTransaction =>
      t.transferTransactionId !== undefined &&
      !allIdSet.has(t.transferTransactionId)
  );

  if (missingPairRow) {
    throw new TransferPairNotFoundError({
      transactionId: missingPairRow.id,
      transferTransactionId: missingPairRow.transferTransactionId,
      userId,
    });
  }

  // TODO:(lewis 2026-02-10 14:24) is this okay?
  const normalTransactions = requested.filter(
    (t): t is DomainNormalTransaction => t.type === "normal"
  );

  // TODO:(lewis 2026-02-10 14:24) is this okay?
  const allTransferTransactions = all.filter(
    (t): t is DomainTransferTransaction => t.type === "transfer"
  );

  return { normalTransactions, allTransferTransactions };
};
