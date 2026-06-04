import { type HydrationContext } from "./normaliseHydrationData";

/**
 * Maps raw payee data into the hydration state.
 *
 * This function:
 * - Iterates over all payees from the raw input
 * - Preserves user-defined metadata (e.g. categorisation preferences)
 * - Indexes payees by ID for efficient lookup in the frontend layer
 *
 * No transformations are applied beyond structural normalisation;
 * the payee data is passed through as-is into a dictionary shape.
 *
 * @param ctx - Hydration context containing raw input data and the mutable
 * hydration state being constructed
 *
 * @returns void (mutates hydration state in place)
 */
export const mapPayees = (ctx: HydrationContext) => {
  const { payees } = ctx.input;
  for (const payee of payees) {
    const { id } = payee;
    ctx.state.payees[id] = {
      id: id,
      userId: payee.userId,
      name: payee.name,
      origin: payee.origin,
      defaultCategoryId: payee.defaultCategoryId,
      includeInPayeeList: payee.includeInPayeeList,
      automaticallyCategorisePayee: payee.automaticallyCategorisePayee,
    };
  }
};
