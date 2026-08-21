import { TransactionBranded } from "@/core/types/NormalizedData";
import { ApiTransaction } from "@/core/types/exported-types";
import {
  AccountId,
  CategoryId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";

export const mapTransaction = (
  transaction: ApiTransaction
): TransactionBranded => ({
  // TODO:(lewis 2026-08-17 04:09) this needs to be a
  id: transaction.id as TransactionId,
  // TODO:(lewis 2026-08-17 04:09) this needs to be a
  accountId: transaction.accountId as AccountId,
  categoryId:
    // TODO:(lewis 2026-08-17 04:09) this needs to be a
    transaction.type === "normal"
      ? (transaction.categoryId as CategoryId)
      : null,
  date: transaction.date,
  inflow: transaction.inflow,
  outflow: transaction.outflow,
  payeeId: transaction.payeeId,
  memo: transaction.memo,
});
