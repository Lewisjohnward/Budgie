import {
  ApiTransaction,
  ApiTransactionNormal,
  ApiTransactionTransfer,
} from "@/core/types/exported-types";
import {
  TransactionBranded,
  TransactionNormal,
  TransactionTransfer,
} from "@/core/types/NormalizedData";
import {
  asAccountId,
  asCategoryId,
  asPayeeId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";

function assertNever(value: never): never {
  throw new Error(`Unhandled transaction type: ${JSON.stringify(value)}`);
}

export function mapTransaction(t: ApiTransaction): TransactionBranded {
  switch (t.type) {
    case "normal":
      return mapNormalTransaction(t);

    case "transfer":
      return mapTransferTransaction(t);

    default:
      return assertNever(t);
  }
}

export function mapTransferTransaction(
  t: ApiTransactionTransfer
): TransactionTransfer {
  return {
    type: "transfer",
    id: asTransactionId(t.id),
    accountId: asAccountId(t.accountId),
    payeeId: t.payeeId ? asPayeeId(t.payeeId) : null,
    date: t.date,
    memo: t.memo,
    inflow: t.inflow,
    outflow: t.outflow,
    transferAccountId: asAccountId(t.transferAccountId),
    transferTransactionId: asTransactionId(t.transferTransactionId),
  };
}

export function mapNormalTransaction(
  t: ApiTransactionNormal
): TransactionNormal {
  return {
    type: "normal",
    id: asTransactionId(t.id),
    accountId: asAccountId(t.accountId),
    categoryId: asCategoryId(t.categoryId),
    payeeId: t.payeeId ? asPayeeId(t.payeeId) : null,
    date: t.date,
    memo: t.memo,
    inflow: t.inflow,
    outflow: t.outflow,
  };
}
