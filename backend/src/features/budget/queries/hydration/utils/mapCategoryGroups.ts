import { extractSystemCategoryGroups } from "../../../core/categorygroup/utils/extractSystemCategoryGroups";
import { type HydrationContext } from "./normaliseHydrationData";

/**
 * Maps raw category group data into the hydration state.
 *
 * This function:
 * - Splits system and user-defined category groups
 * - Normalises and indexes user category groups by ID
 * - Extracts and assigns system category groups (inflow, uncategorised)
 *   into dedicated hydration state slots
 *
 * The result is a structured representation of category groups that is
 * optimised for UI consumption, with fast lookup for user groups and
 * explicit handling of system-defined groups.
 *
 * @param ctx - Hydration context containing:
 *   - raw input data
 *   - current hydration state being built
 *
 * @returns void (mutates hydration state in place)
 */
export const mapCategoryGroups = (ctx: HydrationContext): void => {
  const categoryGroupsSplit = extractSystemCategoryGroups(
    ctx.input.categoryGroups
  );
  for (const group of categoryGroupsSplit.user) {
    const { id } = group;

    ctx.state.categoryGroups.user[id] = {
      id,
      name: group.name,
      position: group.position,
    };
  }

  const inflow = categoryGroupsSplit.system["INFLOW"];
  if (inflow) {
    const { id } = inflow;

    ctx.state.categoryGroups.inflow = {
      id,
      name: inflow.name,
      position: inflow.position,
    };
  }

  const unc = categoryGroupsSplit.system["UNCATEGORISED"];
  if (unc) {
    const { id } = unc;

    ctx.state.categoryGroups.uncategorised = {
      id,
      name: unc.name,
      position: unc.position,
    };
  }
};
