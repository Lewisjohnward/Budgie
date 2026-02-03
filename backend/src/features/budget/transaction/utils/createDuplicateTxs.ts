import { v4 as uuidv4 } from "uuid";
import { asTransactionId, type TransactionId } from "../transaction.types";

type TransactionWithIdAndMemo = {
  id: TransactionId;
  memo?: string | null;
};

/**
 * Creates shallow copies of the given transactions, marking them as duplicates.
 *
 * - Omits the original `id` to allow re-insertion as new records.
 * - Appends " (copy)" to the `memo` field to indicate duplication.
 *
 * @param transactions - The list of transactions to duplicate.
 * @returns A new list of transaction objects without IDs and with modified memos.
 */

export function createDuplicatedTxs<T extends TransactionWithIdAndMemo>(
  transactions: readonly T[]
): T[] {
  return transactions.map((tx) => ({
    ...tx,
    id: asTransactionId(uuidv4()),
    memo: tx.memo ? `${tx.memo} (copy)` : "(copy)",
  }));
}

// TODO:(lewis 2026-02-10 14:46) use this when memo is an empty string in schema
// import type {
//   DomainNormalTransacton,
//   NormalTransactionInsertData,
// } from "../transaction.types";
//
// export function createDuplicatedTxs(
//   transactions: readonly DomainNormalTransacton[]
// ): NormalTransactionInsertData[] {
//     return transactions.map(({ id, ...data }) => ({
//     ...data,
//     memo: `${data.memo} (copy)`,
//     // categoryId stays optional/required exactly as your insert type says
//   }));
// }
