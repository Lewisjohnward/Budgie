import { Prisma } from "@prisma/client";
import { Transaction } from "../../../../../../shared/types/db";
import {
  NoTransactionsFoundError,
  TransferPairMissingError,
} from "../../../transaction.errors";
import {
  NormalTransactionEntity,
  TransferTransactionEntity,
} from "../../../transaction.types";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";

/**
 * Immutable snapshot of a transaction and its transfer relationship at a specific point in time.
 *
 * This discriminated union represents the **validated, domain-safe shape** of a transaction
 * after enforcing all transfer invariants.:
 *
 * - intent construction (deciding *what* should change)
 * - side-effect calculation (balances, months, RTA)
 * - persistence logic (applying changes atomically)
 *
 * Variants:
 *
 * - **NormalTransactionSnapshot**
 *   - `isTransfer` is `false`
 *   - `mainTx` is a normal (non-transfer) transaction
 *   - `pairedTx` is always `null`
 *
 * - **TransferTransactionSnapshot**
 *   - `isTransfer` is `true`
 *   - `mainTx` is a transfer transaction
 *   - `pairedTx` is the required mirrored transfer transaction
 *
 * Invariants (guaranteed by construction):
 * - Normal transactions have no transfer links and a non-null category
 * - Transfer transactions always have a paired transaction
 * - Transfer transactions are excluded from category/month calculations
 *
 * This type allows downstream code to rely on transfer correctness
 * without defensive checks or null assertions.
 */

export type TransactionSnapshot =
  | NormalTransactionSnapshot
  | TransferTransactionSnapshot;

type NormalTransactionSnapshot = {
  isTransfer: false;
  mainTx: NormalTransactionEntity;
  pairedTx: null;
};

type TransferTransactionSnapshot = {
  isTransfer: true;
  mainTx: TransferTransactionEntity;
  pairedTx: TransferTransactionEntity;
};

/**
 * Fetches a validated transaction snapshot and enforces all transfer-related invariants.
 *
 * This function is the **authoritative read boundary** for transaction mutation workflows.
 * It loads a transaction owned by the given user, resolves its paired transfer transaction
 * (if applicable), and **narrows the result into a domain-safe `TransactionSnapshot`**.
 *
 * By the time this function returns, callers can rely on the following guarantees:
 *
 * - The main transaction exists and is owned by the given user
 * - The returned snapshot is correctly discriminated by `isTransfer`
 * - Normal transactions have:
 *   - no transfer links
 *   - a non-null category
 * - Transfer transactions have:
 *   - a non-null `transferAccountId`
 *   - a non-null `transferTransactionId`
 *   - a paired transfer transaction owned by the same user
 *   - no category assignment
 *
 * Any violation of these invariants is treated as a hard error, as it indicates
 * corrupted or inconsistent data.
 *
 * This function should be used as the single entry point for reading transactions
 * prior to applying edits, balance recalculations, or month updates.
 *
 * @param tx - Prisma transaction client used for all database reads
 * @param userId - ID of the user performing the operation (ownership enforced via account)
 * @param transactionId - ID of the transaction to fetch
 *
 * @returns A `TransactionSnapshot`, narrowed to one of:
 * - `NormalTransactionSnapshot` if the transaction is not a transfer
 * - `TransferTransactionSnapshot` if the transaction is a transfer
 *
 * @throws {NoTransactionsFoundError}
 * Thrown if the transaction does not exist or is not owned by the user.
 *
 * @throws {TransferPairMissingError}
 * Thrown if the transaction is marked as a transfer but its paired transaction
 * cannot be found (indicates data corruption).
 *
 * @throws {Error}
 * Thrown if any transfer or normal-transaction invariants are violated
 * (indicates corrupted or invalid persisted state).
 */

export const getTransactionSnapshotWithPair = async (
  tx: Prisma.TransactionClient,
  userId: string,
  transactionId: string
): Promise<TransactionSnapshot> => {
  const mainTx = await transactionRepository.getTransactionById(
    tx,
    userId,
    transactionId
  );
  if (!mainTx) {
    throw new NoTransactionsFoundError();
  }

  const isTransfer = mainTx.transferAccountId !== null;

  // pairedTx is the transaction referenced by transferTransactionId (if present)
  const pairedTx = mainTx.transferTransactionId
    ? await transactionRepository.getTransactionById(
      tx,
      userId,
      mainTx.transferTransactionId
    )
    : null;

  if (!isTransfer) {
    assertNormalTx(mainTx);

    return {
      isTransfer: false,
      mainTx: mainTx as NormalTransactionEntity,
      pairedTx: null,
    };
  }

  if (!pairedTx) {
    throw new TransferPairMissingError();
  }

  assertTransferTx(mainTx);
  assertTransferTx(pairedTx);

  return {
    isTransfer: true,
    mainTx: mainTx,
    pairedTx: pairedTx,
  };
};

/**
 * Enforce "CreatedNormalTransaction"
 * Common invariants:
 * - transferAccountId must be null
 * - transferTransactionId must be null
 * - categoryId must be a string (NOT null)
 */

function assertNormalTx(
  tx: Transaction
): asserts tx is NormalTransactionEntity {
  if (
    tx.transferAccountId !== null ||
    tx.transferTransactionId !== null ||
    tx.categoryId === null
  ) {
    throw new Error(
      `Invariant failed: normal tx invalid
transferAccountId=${tx.transferAccountId}
transferTransactionId=${tx.transferTransactionId}
categoryId=${tx.categoryId}`
    );
  }
}

/**
 * Enforce "CreatedTransferTransaction".
 * Common invariants:
 * - transferAccountId must be string
 * - transferTransactionId must be string
 * - categoryId must be null(transfers excluded)
 * - paired tx must also satisfy same invariants
 */

function assertTransferTx(
  tx: Transaction
): asserts tx is TransferTransactionEntity {
  if (
    tx.transferAccountId === null ||
    tx.transferTransactionId === null ||
    tx.categoryId !== null
  ) {
    throw new Error(
      `Invariant failed: transfer tx invalid
transferAccountId=${tx.transferAccountId}
transferTransactionId=${tx.transferTransactionId}
categoryId=${tx.categoryId}`
    );
  }
}
