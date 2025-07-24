import { Month } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { groupBy } from "../utils/groupBy";

type MonthSlice = Pick<Month, "month" | "activity" | "available" | "assigned">;

export const calculateCategoryMonths = <M extends MonthSlice>(
  categoryMonths: M[],
  changeInAssigned: Decimal,
) => {
  const clone = categoryMonths.map((m) => ({ ...m }));

  let carryOver: Decimal = ZERO;
  return clone.map((month, i) => {
    const isFirst = i === 0;

    const assigned = isFirst
      ? month.assigned.add(changeInAssigned)
      : month.assigned;

    const availableBefore = month.available;

    const availableAfter = isFirst
      ? availableBefore.add(changeInAssigned)
      : availableBefore.add(carryOver);

    if (isFirst) {
      const crossedZeroFromNegative =
        availableBefore.lt(0) && availableAfter.gt(0);
      const stayedPositive = availableBefore.gte(0) && availableAfter.gt(0);
      const crossedZeroToNegative =
        availableBefore.gte(0) && availableAfter.lte(0);

      if (crossedZeroFromNegative) {
        carryOver = availableAfter;
      } else if (stayedPositive) {
        carryOver = changeInAssigned;
      } else if (crossedZeroToNegative) {
        carryOver = availableBefore.negated();
      }
    }
    return {
      ...month,
      assigned,
      available: availableAfter,
    };
  });
};

/**
 * Calculates and returns the updated months per category based on a set of transactions
 * and an operation mode (e.g., adding or deleting transactions).
 *
 * For each category ID:
 * - Fetches its related transactions and months.
 * - Uses `adjustMonthsForMultipleTransactions` to apply balance adjustments to the months,
 *   depending on the operation mode (add/delete).
 *
 * @param categorisedTransactionsGroupedByCategoryId - A mapping of category ID to a list of its transactions.
 * @param monthsGroupedByCategoryId - A mapping of category ID to a list of its corresponding months.
 * @param mode - Indicates whether transactions are being added or deleted.
 * @returns An updated mapping of category ID to the adjusted list of months.
 */

export function calculateMonthsByCategoryId(
  categorisedTransactionsGroupedByCategoryId: Record<
    string,
    (Omit<Transaction, "id"> & { id?: string })[]
  >,
  monthsGroupedByCategoryId: Record<string, Month[]>,
  mode: OperationMode,
) {
  const updatedMonthsByCategoryId: Record<string, Month[]> = {};

  // loop over each category Id: [txs]
  for (const categoryId in categorisedTransactionsGroupedByCategoryId) {
    // transactions for given category
    const txs = categorisedTransactionsGroupedByCategoryId[categoryId];
    // months for given category
    const months = monthsGroupedByCategoryId[categoryId];
    if (!months) continue;

    let updatedMonths = adjustMonthsForMultipleTransactions(txs, months, mode);

    updatedMonthsByCategoryId[categoryId] = updatedMonths;
  }
  return updatedMonthsByCategoryId;
}

/**
 * Adjusts monthly `activity` and `available` fields for category
 * when adding / deleting transactions.
 *
 * Preconditions:
 * - `months` must be sorted in ascending order by `month` date.
 * - All transactions in `txs` must have dates falling within or after the first month in `months`.
 */

import { Transaction } from "@prisma/client";
import { ZERO } from "../../../../shared/constants/zero";
import { OperationMode } from "../../../../shared/enums/operation-mode";

type TxSlice = Pick<Transaction, "inflow" | "outflow" | "date">;

export const adjustMonthsForMultipleTransactions = <
  M extends Pick<Month, "month" | "activity" | "available">,
>(
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

/**
 * Groups an array of `Month` records by their `categoryId`.
 *
 * - Returns a mapping of `categoryId` to an array of corresponding `Month` entries.
 * - Useful for organizing months by category for bulk operations or summaries.
 *
 * @param categoryMonths - An array of `Month` objects, each with a `categoryId`.
 * @returns A record mapping each `categoryId` to an array of `Month` instances.
 */

export function groupMonthsByCategoryId(categoryMonths: Month[]) {
  return groupBy(categoryMonths, (categoryMonths) => categoryMonths.categoryId);
}
