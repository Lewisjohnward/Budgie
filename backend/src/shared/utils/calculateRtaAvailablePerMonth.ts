import { Month } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

type AssignedNegAvailableByMonth = Record<
  string,
  { assigned: Decimal; negativeAvailable: Decimal }
>;

type RtaMonthInput = Pick<Month, "month" | "activity"> & { id?: string };

type RtaMonthOutput = RtaMonthInput & { available: Decimal };
type QueueItem = { key: string; assigned: Decimal };

const toMonthKey = (date: Date) => date.toISOString().slice(0, 7);

export const calculateRtaAvailablePerMonth = (
  rtaMonths: RtaMonthInput[],
  assignedNegAvailableByMonth: AssignedNegAvailableByMonth,
  leftOverBal: Decimal = new Decimal(0),
): RtaMonthOutput[] => {
  const clone = rtaMonths.map((m) => ({
    ...m,
  }));

  let previousMonthOverspend = new Decimal(0);
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
    const monthKey = toMonthKey(m.month);
    const monthAvailableNegative =
      assignedNegativeAvailableClone[monthKey]?.negativeAvailable ??
      new Decimal(0);
    const monthAssigned =
      assignedNegativeAvailableClone[monthKey]?.assigned || new Decimal(0);

    // left over from previous month
    let available = previousMonthBalance
      // rta txs for month
      .add(m.activity)
      // subtract previous month overspend
      .add(previousMonthOverspend)
      // subtract assigned
      .sub(assignedInFuture.gt(0) ? monthAssigned : new Decimal(0));

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
