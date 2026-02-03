import { db } from "../transaction.types";
import { type DomainNormalTransaction } from "../transaction.types";
import { toDomainTransaction } from "./toDomainTransaction";
import { invariant } from "./invariant";

/**
 * Maps DB row to DomainNormalTransaction
 */
export const toDomainNormalTransaction = (
  row: db.Transaction
): DomainNormalTransaction => {
  const tx = toDomainTransaction(row);
  invariant(tx.type === "normal", "Expected normal transaction");
  return tx;
};
