/**
 * Groups transactions by their `categoryId`.
 *
 * - Returns a mapping of each `categoryId` to the list of transactions assigned to it.
 * - Useful for aggregating or processing transactions on a per-category basis.
 * - Works with both persisted and new (optional `id`) transactions.
 *
 * @param transactions - The list of transactions to group.
 * @returns A record mapping category IDs to arrays of their corresponding transactions.
 */

import { groupBy } from "../utils/groupBy";
import { Transaction } from "@prisma/client";

export function groupTransactionsByCategoryId(
  transactions: (Omit<Transaction, "id"> & { id?: string })[]
) {
  //@ts-ignore-error: due to change in transaction categoryId to string | null to have transfer transactions
  return groupBy(transactions, (tx) => tx.categoryId);
}
