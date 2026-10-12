import {
  type TransactionTransferDto,
  type DomainTransaction,
} from "../transaction.types";

/**
 * Converts a domain transfer transaction into a transfer
 * DTO representation
 * suitable for API responses.
 */
export const toTransactionTransferDto = (
  tx: DomainTransaction
): TransactionTransferDto => {
  if (tx.type === "normal") {
    throw new Error("Cant map normal transactions to transfer transactions");
  }

  const base = {
    id: tx.id,
    accountId: tx.accountId,
    payeeId: tx.payeeId ?? null,
    date: tx.date.toISOString(),
    memo: tx.memo,
    inflow: Number(tx.inflow),
    outflow: Number(tx.outflow),
    transferAccountId: tx.transferAccountId,
    transferTransactionId: tx.transferTransactionId,
  };

  return {
    type: "transfer",
    ...base,
  } satisfies TransactionTransferDto;
};
