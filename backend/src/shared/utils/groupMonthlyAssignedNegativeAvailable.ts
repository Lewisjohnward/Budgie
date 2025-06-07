import { Month } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

type MonthlyAssignedNegativeAvailable = Record<
  string,
  { assigned: Decimal; negativeAvailable: Decimal }
>;

export function groupMonthlyAssignedNegativeAvailable(
  months: Month[],
): Record<string, { assigned: Decimal; negativeAvailable: Decimal }> {
  const result: MonthlyAssignedNegativeAvailable = {};
  months.forEach((m) => {
    const key = m.month.toISOString().slice(0, 7);
    if (!result[key]) {
      result[key] = {
        assigned: new Decimal(0),
        negativeAvailable: new Decimal(0),
      };
    }
    result[key].assigned = result[key].assigned.add(m.assigned);
    if (m.available.lt(0)) {
      result[key].negativeAvailable = result[key].negativeAvailable.add(
        m.available,
      );
    }
  });
  return result;
}
