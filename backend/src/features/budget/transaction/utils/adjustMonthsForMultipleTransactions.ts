/**
 * Adjusts monthly `activity` and `available` fields for category
 * when adding / deleting transactions.
 *
 * Preconditions:
 * - `months` must be sorted in ascending order by `month` date.
 * - All transactions in `txs` must have dates falling within or after the first month in `months`.
 */

import { Month, Transaction } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ZERO } from "../../../../shared/constants/zero";
import { OperationMode } from "../../../../shared/enums/operation-mode";

type TxSlice = Pick<Transaction, "inflow" | "outflow" | "date">;
type MonthSlice = Pick<Month, "month" | "activity" | "available">;

export const adjustMonthsForMultipleTransactions = <M extends MonthSlice>(
  txs: Array<TxSlice>,
  months: M[],
  mode: OperationMode,
) => {
  const clone = txs.map((tx) => ({ ...tx }));

  for (const tx of clone) {
    const { inflow, outflow, date: txDate } = tx;
    const baseChange = inflow.sub(outflow);
    const change = mode === OperationMode.Add ? baseChange.neg() : baseChange;

    const monthIndex = months.findIndex(
      (m) => m.month.getTime() >= txDate.getTime(),
    );

    if (monthIndex === -1) continue;
    let remainingPositiveAvailable: Decimal = ZERO;
    for (let i = monthIndex; i < months.length; i++) {
      const month = months[i];
      if (month.month.getTime() === txDate.getTime()) {
        month.activity = month.activity.sub(change);
        month.available = month.available.sub(change);
      }

      if (month.month.getTime() > txDate.getTime()) {
        month.available = remainingPositiveAvailable.add(month.activity);
      }

      remainingPositiveAvailable = month.available.gte(0)
        ? month.available
        : ZERO;
    }
  }

  return months;
};
