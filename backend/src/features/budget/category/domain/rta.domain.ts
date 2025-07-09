import { Month, Transaction } from "@prisma/client";
import { ZERO } from "../../../../shared/constants/zero";
import { getMonthKey } from "../../../../shared/utils/getMonthKey";
import { Decimal } from "@prisma/client/runtime/library";
import { OperationMode } from "../../../../shared/enums/operation-mode";

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

/**
 * Updates the activity field of a list of RTA (Ready-To-Assign) months
 * based on grouped transaction activity per month and the specified operation mode.
 *
 * For each month:
 * - Looks up the total transaction activity from the `groupedRtaTxsByMonth` map.
 * - If there's no change (i.e., zero), skips the month.
 * - Otherwise, updates the month's `activity` field:
 *    - Adds the amount if mode is `Add`
 *    - Subtracts the amount if mode is `Delete`
 *
 * Filters out any months that have no ID or no activity change.
 *
 * @param rtaMonths - The original list of RTA months to update.
 * @param groupedRtaTxsByMonth - A map of month keys (e.g., "2025-07") to total transaction activity as Decimals.
 * @param mode - Indicates whether transactions are being added or deleted.
 * @returns A filtered list of updated months with adjusted activity values.
 */

export function calculateRtaMonthsActivity(
  rtaMonths: Month[],
  groupedRtaTxsByMonth: Record<string, Decimal>,
  mode: OperationMode,
) {
  return rtaMonths
    .map((rtaM) => {
      const changeInActivity =
        groupedRtaTxsByMonth[getMonthKey(rtaM.month)] ?? ZERO;
      if (changeInActivity.isZero()) return null;

      const updatedMonth = {
        ...rtaM,
        activity:
          mode === OperationMode.Delete
            ? rtaM.activity.sub(changeInActivity)
            : rtaM.activity.add(changeInActivity),
      };
      return updatedMonth;
    })
    .filter((m): m is Month => m !== null && m.id !== undefined);
}

type AssignedNegAvailableByMonth = Record<
  string,
  { assigned: Decimal; negativeAvailable: Decimal }
>;

type QueueItem = { key: string; assigned: Decimal };

type MonthSlice = Pick<Month, "month" | "activity">;
type WithAvailable<M> = M & { available: Decimal };

export const calculateRtaAvailablePerMonth = <M extends MonthSlice>(
  rtaMonths: M[],
  assignedNegAvailableByMonth: AssignedNegAvailableByMonth,
  leftOverBal: Decimal = ZERO,
): WithAvailable<M>[] => {
  const clone = rtaMonths.map((m) => ({
    ...m,
  }));

  let previousMonthOverspend = ZERO;
  let previousMonthBalance = leftOverBal;

  const assignedNegativeAvailableClone = Object.fromEntries(
    Object.entries(assignedNegAvailableByMonth).map(([k, v]) => [
      k,
      {
        assigned: new Decimal(v.assigned),
        negativeAvailable: new Decimal(v.negativeAvailable),
      },
    ]),
  );

  const queue: QueueItem[] = Object.entries(assignedNegativeAvailableClone)
    .filter(([_, v]) => v.assigned.gt(0))
    .map(([key, v]) => ({ key, assigned: v.assigned }));

  let assignedInFuture = Object.values(assignedNegativeAvailableClone).reduce(
    (sum, { assigned }) => sum.add(assigned),
    new Decimal(0),
  );

  return clone.map((m) => {
    const monthKey = getMonthKey(m.month);
    const monthAvailableNegative =
      assignedNegativeAvailableClone[monthKey]?.negativeAvailable ??
      new Decimal(0);
    const monthAssigned =
      assignedNegativeAvailableClone[monthKey]?.assigned || ZERO;

    // left over from previous month
    let available = previousMonthBalance
      // rta txs for month
      .add(m.activity)
      // subtract previous month overspend
      .add(previousMonthOverspend)
      // subtract assigned
      .sub(assignedInFuture.gt(0) ? monthAssigned : ZERO);

    assignedInFuture = assignedInFuture.sub(monthAssigned);

    // subtract future assigned amounts
    if (available.gt(0) && assignedInFuture.gt(0)) {
      let toSubtract = Decimal.min(available, assignedInFuture);
      available = available.sub(toSubtract);
      assignedInFuture = assignedInFuture.sub(toSubtract);

      // Use the queue to subtract from assigned progressively
      while (toSubtract.gt(0) && queue.length > 0) {
        const front = queue[0];
        const subtractNow = Decimal.min(front.assigned, toSubtract);

        front.assigned = front.assigned.sub(subtractNow);
        // update the assigned for the month
        assignedNegativeAvailableClone[front.key].assigned = front.assigned;

        toSubtract = toSubtract.sub(subtractNow);

        if (front.assigned.equals(0)) {
          queue.shift();
        }
      }
    }

    previousMonthBalance = available;
    previousMonthOverspend = monthAvailableNegative;

    return {
      ...m,
      available,
    };
  });
};
