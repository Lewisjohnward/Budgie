import { roundToStartOfMonth } from "../../../../shared/utils/roundToStartOfMonth";
import { type DomainNormalTransaction } from "../../transaction/transaction.types";

/**
 * Rounds the `date` field of each transaction to the first day of its month (midnight UTC).
 *
 * Responsibilities:
 * - Iterates over an array of normal transactions and replaces each `date`
 *   with the UTC start-of-month equivalent via `roundToStartOfMonth`.
 * - Returns a **new array** of transactions; the originals are not mutated.
 *
 * Notes:
 * - Time component is zeroed out (e.g. `2025-06-15T14:30:00Z` → `2025-06-01T00:00:00Z`).
 * - All other transaction fields are preserved as-is via shallow spread.
 *
 * @param transactions - The array of normal transactions whose dates should be rounded.
 * @returns A new array of `DomainNormalTransaction` with dates set to the start of their respective months.
 */
export const roundTransactionsToStartOfMonth = (
  transactions: DomainNormalTransaction[]
): DomainNormalTransaction[] => {
  return transactions.map((t) => ({
    ...t,
    date: roundToStartOfMonth(t.date),
  }));
};
