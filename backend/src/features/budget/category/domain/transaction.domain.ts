/**
 * Groups an array of normal transactions by their `categoryId`.
 *
 * Each key in the returned record corresponds to a `categoryId`, and the
 * associated value is an array of transactions belonging to that category.
 *
 * This is useful for:
 * - Aggregating transactions per category
 * - Calculating category-specific totals or metrics
 * - Organizing transactions for month/category updates
 *
 * @param transactions - Array of `DomainNormalTransaction` objects to group.
 * @returns A record mapping each `categoryId` to an array of transactions assigned to it.
 */

import { type DomainNormalTransaction } from "../../transaction/transaction.types";
import { groupBy } from "../utils/groupBy";

export function groupTransactionsByCategoryId(
  transactions: DomainNormalTransaction[]
) {
  return groupBy(transactions, (tx) => tx.categoryId);
}
