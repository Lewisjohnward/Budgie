import { db } from "../transaction.types";
import {
  type DomainNormalTransaction,
  type DomainTransferSourceTransaction,
  type DomainTransferDestinationTransaction,
} from "../transaction.types";
import { toDomainTransaction } from "./toDomainTransaction";
import { invariant } from "./invariant";

/**
 * Generic mapper to any Domain transaction type
 */
export const toDomainAnyTransaction = (
  row: db.Transaction
):
  | DomainNormalTransaction
  | DomainTransferSourceTransaction
  | DomainTransferDestinationTransaction => {
  const tx = toDomainTransaction(row);

  if (tx.type === "transfer") {
    if (tx.transferTransactionId) {
      // Destination transfer
      return {
        ...tx,
        type: "transfer",
        transferAccountId: tx.transferAccountId,
        transferTransactionId: tx.transferTransactionId,
      } as DomainTransferDestinationTransaction;
    } else {
      // Source transfer
      return {
        ...tx,
        type: "transfer",
        transferAccountId: tx.transferAccountId,
        transferTransactionId: undefined,
      } as DomainTransferSourceTransaction;
    }
  }

  // Normal transaction
  return {
    ...tx,
    type: "normal",
    categoryId: tx.categoryId!,
    transferAccountId: undefined,
    transferTransactionId: undefined,
  } as DomainNormalTransaction;
};
