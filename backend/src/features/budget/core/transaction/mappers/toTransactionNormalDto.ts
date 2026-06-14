import {
  type DomainTransaction,
  type TransactionNormalDto,
} from "../transaction.types";

/**
 * Converts a domain transaction into a normal DTO representation
 * suitable for API responses.
 */
export const toTransactionNormalDto = (
  tx: DomainTransaction
): TransactionNormalDto => {
  if (tx.type === "transfer") {
    throw new Error("Cant map transfer transactions to normal transactions");
  }

  const base = {
    id: tx.id,
    accountId: tx.accountId,
    payeeId: tx.payeeId ?? null,
    date: tx.date.toISOString(),
    memo: tx.memo,
    inflow: Number(tx.inflow),
    outflow: Number(tx.outflow),
  };

  return {
    type: "normal",
    ...base,
    categoryId: tx.categoryId,
  } satisfies TransactionNormalDto;
};
