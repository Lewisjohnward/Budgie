import { ApiTransaction } from "@/core/types/exported-types";
import {
  asAccountId,
  asCategoryId,
  asPayeeId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";

export function mapTransaction(t: ApiTransaction) {
  if (t.type === "normal") {
    return {
      type: "normal" as const,
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
  return {
    type: "transfer" as const,
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
