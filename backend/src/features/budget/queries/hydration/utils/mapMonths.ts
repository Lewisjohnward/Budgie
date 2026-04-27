import { convertDecimalToNumber } from "../../../../../shared/utils/convertDecimalToNumber";
import { toMonthKey } from "../../../utils/toMonthKey";
import { type HydrationContext } from "./normaliseHydrationData";

/**
 * Maps raw monthly budget data into the hydration state.
 *
 * This function:
 * - Iterates over all month records from the raw input
 * - Normalises date values into consistent month keys
 * - Converts financial fields from decimal to number for safe arithmetic
 * - Indexes months by ID for fast lookup in the frontend layer
 *
 * The resulting structure is used for budget calculations and UI rendering,
 * where each month is associated with a category and precomputed financial
 * totals.
 *
 * @param ctx - Hydration context containing raw input data and the mutable
 * hydration state being constructed
 *
 * @returns void (mutates hydration state in place)
 */
export const mapMonths = (ctx: HydrationContext): void => {
  const { months } = ctx.input;
  for (const m of months) {
    const { id } = m;

    ctx.state.months[id] = {
      id,
      categoryId: m.categoryId,
      month: toMonthKey(m.month),
      activity: convertDecimalToNumber(m.activity),
      assigned: convertDecimalToNumber(m.assigned),
      available: convertDecimalToNumber(m.available),
    };
  }
};
