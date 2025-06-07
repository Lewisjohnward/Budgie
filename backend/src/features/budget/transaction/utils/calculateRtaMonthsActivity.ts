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

import { Month } from "@prisma/client";
import { ZERO } from "../../../../shared/constants/zero";
import { getMonthKey } from "../../../../shared/utils/getMonthKey";
import { Decimal } from "@prisma/client/runtime/library";
import { OperationMode } from "../../../../shared/enums/operation-mode";

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
