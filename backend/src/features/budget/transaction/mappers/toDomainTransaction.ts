import { db } from "../transaction.types";
import { asAccountId } from "../../account/account.types";
import { asCategoryId } from "../../category/category.types";
import {
  asTransactionId,
  type DomainTransaction,
  type DomainNormalTransaction,
  type DomainTransferTransaction,
} from "../transaction.types";
import { invariant } from "./invariant";

/**
 * Maps a raw DB row to a DomainTransaction.
 * Adds `type: "normal" | "transfer"` discriminator.
 */
export const toDomainTransaction = (row: db.Transaction): DomainTransaction => {
  const base = {
    id: asTransactionId(row.id),
    accountId: asAccountId(row.accountId),
    payeeId: row.payeeId ?? undefined,
    date: row.date,
    memo: row.memo ?? "",
    inflow: row.inflow,
    outflow: row.outflow,
  };

  // Determine if transfer row
  const isTransfer = row.categoryId === null && row.transferAccountId !== null;

  if (isTransfer) {
    invariant(
      row.transferAccountId !== null,
      "Transfer must have transferAccountId"
    );

    const transferBase = {
      ...base,
      type: "transfer" as const,
      transferAccountId: asAccountId(row.transferAccountId),
      transferTransactionId: row.transferTransactionId
        ? asTransactionId(row.transferTransactionId)
        : undefined,
    };

    return transferBase as DomainTransferTransaction;
  }

  // Normal transaction
  invariant(row.categoryId !== null, "Normal transaction must have categoryId");

  return {
    ...base,
    type: "normal" as const,
    categoryId: asCategoryId(row.categoryId),
    transferAccountId: undefined,
    transferTransactionId: undefined,
  } as DomainNormalTransaction;
};
