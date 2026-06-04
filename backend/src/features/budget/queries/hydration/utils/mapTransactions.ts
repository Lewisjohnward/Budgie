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
  for (const t of ctx.input.transactions) {
    if (t.type === "normal") {
      ctx.state.transactions[t.id] = {
        type: t.type,
        id: t.id,
        accountId: t.accountId,
        categoryId: t.categoryId,
        payeeId: t.payeeId,
        date: t.date,
        memo: t.memo,
        inflow: t.inflow,
        outflow: t.outflow,
      };

      continue;
    }

    ctx.state.transactions[t.id] = {
      type: t.type,
      id: t.id,
      accountId: t.accountId,
      payeeId: t.payeeId,
      date: t.date,
      memo: t.memo,
      inflow: t.inflow,
      outflow: t.outflow,
      transferAccountId: t.transferAccountId,
      transferTransactionId: t.transferTransactionId,
    };
  }
};
