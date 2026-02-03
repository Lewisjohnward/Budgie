import { Prisma } from "@prisma/client";
import {
  TransferPairMissingError,
  PairedTransactionNotTransferError,
} from "../../../transaction.errors";
import { getTransactionById } from "../../services/getTransactionById";
import {
  type DomainNormalTransaction,
  type DomainTransferTransaction,
  type TransactionId,
} from "../../../transaction.types";
import { type UserId } from "../../../../../user/auth/auth.types";

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
  mainTx: DomainNormalTransaction;
  pairedTx: null;
};

type TransferTransactionSnapshot = {
  isTransfer: true;
  mainTx: DomainTransferTransaction;
  pairedTx: DomainTransferTransaction;
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
  userId: UserId,
  transactionId: TransactionId
): Promise<TransactionSnapshot> => {
  const main = await getTransactionById(tx, userId, transactionId);

  if (main.type === "normal") {
    // safe: mainTx is already DomainNormalTransaction
    return {
      isTransfer: false,
      mainTx: main,
      pairedTx: null,
    };
  }

  // main.type === "transfer"
  // paired transaction must exist
  if (!main.transferTransactionId) {
    throw new TransferPairMissingError();
  }

  const paired = await getTransactionById(
    tx,
    userId,
    main.transferTransactionId
  );

  if (paired.type !== "transfer") {
    throw new PairedTransactionNotTransferError();
  }

  return {
    isTransfer: true,
    mainTx: main,
    pairedTx: paired,
  };
};
