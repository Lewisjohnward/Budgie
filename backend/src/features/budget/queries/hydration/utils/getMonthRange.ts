import { type DomainMemo } from "../../../core/memo/memo.types";

/**
 * Computes the inclusive date range covered by a list of memos.
 *
 * This function scans all memo entries and determines the earliest and
 * latest `month` values, returning them as a bounded range.
 *
 * It assumes:
 * - Each memo has a valid `month` Date
 * - The input array is non-empty
 *
 * ⚠️ Throws if the input array is empty, since a valid range cannot be derived.
 *
 * @param memos - Array of domain memos containing month-based timestamps
 *
 * @returns An object representing the time range of the memos
 * @returns from - The earliest month date in the collection
 * @returns to - The latest month date in the collection
 *
 * @throws Error if `memos` is empty
 */

export const getMonthRange = (
  memos: DomainMemo[]
): {
  from: Date;
  to: Date;
} => {
  if (memos.length === 0) {
    throw new Error("There are no memos");
  }

  let minDate = memos[0].month;
  let maxDate = memos[0].month;

  for (const m of memos) {
    if (m.month < minDate) minDate = m.month;
    if (m.month > maxDate) maxDate = m.month;
  }

  return {
    from: minDate,
    to: maxDate,
  };
};
