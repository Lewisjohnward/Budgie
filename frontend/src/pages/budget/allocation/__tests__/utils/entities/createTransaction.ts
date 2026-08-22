import { ApiTransaction } from "@/core/types/exported-types";
import { defaultMonth } from "./defaults";

type CreateNormalTransactionOverrides = Partial<
  Extract<ApiTransaction, { type: "normal" }>
> & {
  id: string;
  accountId: string;
  categoryId: string;
};

export function createNormalTransaction({
  id,
  accountId,
  categoryId,
  date = new Date(`${defaultMonth}-01`).toISOString(),
  inflow = 0,
  outflow = 10,
  payeeId = null,
  memo = "",
}: CreateNormalTransactionOverrides): Extract<
  ApiTransaction,
  { type: "normal" }
> {
  return {
    type: "normal",
    id,
    accountId,
    categoryId,
    date,
    inflow,
    outflow,
    payeeId,
    memo,
  };
}
