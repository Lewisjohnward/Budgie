import { v4 as uuidv4 } from "uuid";
import { asTransactionId, type TransactionId } from "../transaction.types";

type TransactionWithIdAndMemo = {
  id: TransactionId;
  memo?: string | null;
};

/**
 * Creates shallow duplicates of a list of transactions for re-insertion.
 *
 * Each transaction is copied with a new unique `id` and its `origin` set to `"USER"`.
 * This ensures that duplicated transactions are treated as new records in the system.
 *
 * Notes:
 * - Original `id`s are replaced to prevent conflicts in the database.
 * - `memo` is preserved but can be modified outside this function if needed.
 * - Only shallow copies are created; nested objects are shared by reference.
 *
 * @template T - A transaction type that must include `id` and optionally `memo`.
 * @param {readonly T[]} transactions - The array of transactions to duplicate.
 * @returns {T[]} An array of new transaction objects with new `id`s and `origin: "USER"`.
 *
 * @example
 * const originalTxs = [
 *   { id: "tx-1", memo: "Salary", inflow: 1000, outflow: 0, accountId: "acc-1" }
 * ];
 *
 * const duplicatedTxs = createDuplicatedTxs(originalTxs);
 * // duplicatedTxs[0].id !== originalTxs[0].id
 * // duplicatedTxs[0].origin === "USER"
 */
export function createDuplicatedTxs<T extends TransactionWithIdAndMemo>(
  transactions: readonly T[]
): T[] {
  return transactions.map((tx) => ({
    ...tx,
    id: asTransactionId(uuidv4()),
    origin: "USER",
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
