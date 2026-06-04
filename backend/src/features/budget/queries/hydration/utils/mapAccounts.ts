import { type HydrationContext } from "./normaliseHydrationData";

/**
 * Maps raw account data into the hydration state.
 *
 * This function:
 * - Iterates over all accounts from the raw input
 * - Normalises numeric values (e.g. balance conversion from decimal to number)
 * - Indexes accounts by ID for fast lookup in the UI layer
 *
 * The resulting structure is optimised for frontend consumption, where
 * accounts are accessed frequently and require fast dictionary-style lookup.
 *
 * @param ctx - Hydration context containing raw input data and mutable
 * hydration state being built
 *
 * @returns void (mutates hydration state in place)
 */
export const mapAccounts = (ctx: HydrationContext): void => {
  const { accounts } = ctx.input;
  for (const account of accounts) {
    ctx.state.accounts[account.id] = {
      userId: account.userId,
      id: account.id,
      name: account.name,
      position: account.position,
      open: account.open,
      type: account.type,
      deletable: account.deletable,
      balance: account.balance,
    };
  }
};
