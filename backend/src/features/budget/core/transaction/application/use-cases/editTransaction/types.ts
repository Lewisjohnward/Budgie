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

import {
  DomainNormalTransaction,
  DomainTransferTransaction,
} from "../../../transaction.types";

export type TransactionSnapshot =
  NormalTransactionSnapshot | TransferTransactionSnapshot;

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
