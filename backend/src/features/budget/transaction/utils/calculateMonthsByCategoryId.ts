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

import { Month, Transaction } from "@prisma/client";
import { adjustMonthsForMultipleTransactions } from "./adjustMonthsForMultipleTransactions";
import { OperationMode } from "../../../../shared/enums/operation-mode";

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
