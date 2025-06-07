/**
 * Creates shallow copies of the given transactions, marking them as duplicates.
 *
 * - Omits the original `id` to allow re-insertion as new records.
 * - Appends " (copy)" to the `memo` field to indicate duplication.
 *
 * @param transactions - The list of transactions to duplicate.
 * @returns A new list of transaction objects without IDs and with modified memos.
 */

import { Transaction } from "@prisma/client";

export function createDuplicatedTxs(
  transactions: Transaction[],
): (Omit<Transaction, "id"> & { id?: string })[] {
  return transactions.map(({ id, ...data }) => ({
    ...data,
    memo: data.memo ? `${data.memo} (copy)` : "(copy)",
  }));
}
