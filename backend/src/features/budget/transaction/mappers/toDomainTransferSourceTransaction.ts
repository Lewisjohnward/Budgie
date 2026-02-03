import { db } from "../transaction.types";
import { type DomainTransferSourceTransaction } from "../transaction.types";
import { toDomainTransaction } from "./toDomainTransaction";
import { invariant } from "./invariant";

/**
 * Maps DB row to DomainTransferSourceTransaction
 * (transferTransactionId must be null)
 */
export const toDomainTransferSourceTransaction = (
  row: db.Transaction
): DomainTransferSourceTransaction => {
  const tx = toDomainTransaction(row);

  invariant(tx.type === "transfer", "Expected transfer transaction");
  invariant(
    tx.transferTransactionId === undefined,
    "Source transfer must not have transferTransactionId yet"
  );

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
    transferTransactionId: undefined,
  };
};
