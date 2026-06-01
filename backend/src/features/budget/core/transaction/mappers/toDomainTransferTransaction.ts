import { db, type DomainTransferTransaction } from "../transaction.types";
import { toDomainTransaction } from "./toDomainTransaction";
import { invariant } from "./invariant";

/**
 * Maps DB row to DoomainTransferTransaction
 */
export const toDomainTransferTransaction = (
  row: db.Transaction
): DomainTransferTransaction => {
  const tx = toDomainTransaction(row);

  invariant(tx.type === "transfer", "Expected transfer transaction");

  return {
    type: "transfer",
    id: tx.id,
    accountId: tx.accountId,
    payeeId: tx.payeeId,
    date: tx.date,
    memo: tx.memo,
    inflow: tx.inflow,
    outflow: tx.outflow,
    transferAccountId: tx.transferAccountId,
    transferTransactionId: tx.transferTransactionId,
  };
};
