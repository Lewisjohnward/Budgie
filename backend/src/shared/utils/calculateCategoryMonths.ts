import { Month } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const ZERO = new Decimal(0);
type MonthSlice = Pick<Month, "month" | "activity" | "available" | "assigned">;

export const calculateCategoryMonths = <M extends MonthSlice>(
  categoryMonths: M[],
  leftOverAvailable: Decimal,
  inflow: Decimal = ZERO,
  outflow: Decimal = ZERO,
) => {
  const netChange = inflow.sub(outflow);

  const clone = categoryMonths.map((m) => ({ ...m }));

  return clone.map((month, index) => {
    const activity =
      index === 0 ? month.activity.add(netChange) : month.activity;

    const available = month.assigned
      .add(activity)
      .add(leftOverAvailable.gt(0) ? leftOverAvailable : new Decimal(0));

    leftOverAvailable = available;

    return {
      ...month,
      activity,
      available,
    };
  });
};
