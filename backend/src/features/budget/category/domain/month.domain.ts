import { Month } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { groupBy } from "../utils/groupBy";

/**
 * Adjusts a list of monthly category data based on a change in assigned funds.
 *
 * The function recalculates each month's `assigned` and `available` values.
 * The first month receives the direct change in assigned funds, and depending on the
 * before/after available amounts, a `carryOver` value is calculated and applied
 * to subsequent months to reflect the effect of crossing availability thresholds (e.g. from negative to positive).
 *
 * @template M - A subtype of MonthSlice, representing the shape of a month object.
 * @param categoryMonths - The list of months to adjust (each with `month`, `activity`, `available`, `assigned`).
 * @param changeInAssigned - The amount to add to the first month's `assigned` value.
 * @returns A new array of months with updated `assigned` and `available` values.
 */

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
      const crossedZeroFromPositive =
        availableBefore.gte(0) && availableAfter.lte(0);

      if (crossedZeroFromNegative) {
        carryOver = availableAfter;
      } else if (stayedPositive) {
        carryOver = changeInAssigned;
      } else if (crossedZeroFromPositive) {
        carryOver = availableBefore.negated();
      }
    } else {
      const crossedZeroFromNegative =
        availableBefore.lt(0) && availableAfter.gt(0);

      if (crossedZeroFromNegative) {
        carryOver = availableAfter;
      } else {
        carryOver = availableAfter.gt(0)
          ? availableAfter.sub(availableBefore)
          : ZERO;
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
 * Adjusts each month's `activity` and `available` fields based on a list of transactions,
 * either adding or removing them depending on the operation mode.
 *
 * Behavior:
 * - Transactions affect the first matching month and all subsequent months.
 * - If a month matches the transaction date, its `activity` and `available` are adjusted.
 * - Subsequent months get updated `available = activity + remaining positive availability`.
 *
 * @param txs - List of transactions to apply.
 * @param months - List of months to adjust (sorted by date ascending).
 * @param mode - Whether transactions are being added or removed.
 * @returns A new array of adjusted months.
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
