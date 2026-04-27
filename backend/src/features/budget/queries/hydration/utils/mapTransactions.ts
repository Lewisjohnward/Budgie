import { convertDecimalToNumber } from "../../../../../shared/utils/convertDecimalToNumber";
import { type HydrationContext } from "./normaliseHydrationData";

/**
 * Maps raw transaction data into the hydration state.
 *
 * This function:
 * - Iterates over all transactions from the raw input
 * - Normalises monetary values (converting inflow/outflow from decimal to number)
 * - Indexes transactions by ID for fast lookup in the UI layer
 *
 * The resulting structure is optimised for frontend usage, where transactions
 * are frequently accessed and aggregated by related entities (accounts, categories).
 *
 * @param ctx - Hydration context containing raw input data and the mutable
 * hydration state being constructed
 *
 * @returns void (mutates hydration state in place)
 */
export const mapTransactions = (ctx: HydrationContext): void => {
  const { transactions } = ctx.input;
  for (const t of transactions) {
    ctx.state.transactions[t.id] = {
      id: t.id,
      accountId: t.accountId,
      categoryId: t.type === "normal" ? t.categoryId : undefined,
      payeeId: t.payeeId,
      date: t.date.toISOString(),
      memo: t.memo,
      inflow: convertDecimalToNumber(t.inflow),
      outflow: convertDecimalToNumber(t.outflow),
    };
  }
};
