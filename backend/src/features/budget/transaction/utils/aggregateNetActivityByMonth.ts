/**
 * Aggregates net activity of RTA transactions grouped by month.
 *
 * - Computes net amount as `inflow - outflow` for each transaction.
 * - Groups transactions by month using `getMonthKey(tx.date)` (e.g., "2025-07").
 * - Returns a map of month keys to the total net amount (`Decimal`) for that month.
 *
 * @param rtaTxs - A list of RTA transactions (optional `id` for new/duplicated).
 * @returns A record mapping month strings (e.g., "2025-07") to summed net `Decimal` values.
 */

import { Decimal } from "@prisma/client/runtime/library";
import { getMonthKey } from "../../../../shared/utils/getMonthKey";
import { Transaction } from "@prisma/client";

export function aggregateNetActivityByMonth(
  rtaTxs: (Omit<Transaction, "id"> & { id?: string })[],
) {
  const groupedRtaTxsByMonth: Record<string, Decimal> = {};

  for (const tx of rtaTxs) {
    const key = getMonthKey(tx.date);
    const net = tx.inflow.sub(tx.outflow);

    if (!groupedRtaTxsByMonth[key]) {
      groupedRtaTxsByMonth[key] = new Decimal(0);
    }

    groupedRtaTxsByMonth[key] = groupedRtaTxsByMonth[key].add(net);
  }
  return groupedRtaTxsByMonth;
}
