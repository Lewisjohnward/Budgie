import { toMonthKey } from "../../../utils/toMonthKey";
import { HydrationInvariantError } from "../hydration.errors";
import { type HydrationContext } from "./normaliseHydrationData";

/**
 * Maps raw memo data into the hydration state, grouped by month.
 *
 * This function:
 * - Iterates over all memos from the raw input
 * - Normalises memo month values into consistent month keys
 * - Stores memos in a month-indexed dictionary (`memosByMonth`)
 * - Enforces a strict invariant that only one memo can exist per month
 *
 * If a duplicate memo is detected for the same month key, an error is thrown
 * to preserve data integrity in the hydration model.
 *
 * @param ctx - Hydration context containing raw input data and the mutable
 * hydration state being constructed
 *
 * @throws Error if multiple memos are found for the same month key
 *
 * @returns void (mutates hydration state in place)
 */
export const mapMemos = (ctx: HydrationContext): void => {
  const { memos } = ctx.input;
  for (const memo of memos) {
    const key = toMonthKey(memo.month);

    // Ensure that each monthKey corresponds to a single memo
    if (ctx.state.memosByMonth[key]) {
      throw new HydrationInvariantError(
        `Duplicate memo for monthKey: ${key}`,
        "DUPLICATE_DATA"
      );
    }
    ctx.state.memosByMonth[key] = {
      id: memo.id,
      month: key,
      content: memo.content,
    };
  }
};
