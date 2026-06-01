import {
  type DomainTransaction,
  type TransactionDto,
  type TransactionNormalDto,
  type TransactionTransferDto,
} from "../transaction.types";

/**
 * Converts a domain transaction into a DTO representation
 * suitable for API responses.
 */
export const toTransactionDto = (tx: DomainTransaction): TransactionDto => {
  const base = {
    id: tx.id,
    accountId: tx.accountId,
    payeeId: tx.payeeId ?? null,
    date: tx.date.toISOString(),
    memo: tx.memo,
    inflow: Number(tx.inflow),
    outflow: Number(tx.outflow),
  };

  if (tx.type === "normal") {
    return {
      type: "normal",
      ...base,
      categoryId: tx.categoryId,
    } satisfies TransactionNormalDto;
  }

  return {
    type: "transfer",
    ...base,
    transferAccountId: tx.transferAccountId,
    transferTransactionId: tx.transferTransactionId,
  } satisfies TransactionTransferDto;
};
