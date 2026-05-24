import { extractSystemCategoryGroups } from "../../../core/categorygroup/utils/extractSystemCategoryGroups";
import { type HydrationContext } from "./normaliseHydrationData";

/**
 * Maps raw category group data into the hydration state.
 *
 * This =function:
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
  const userGroups = ctx.input.categoryGroups.user;
  const systemGroups = ctx.input.categoryGroups.system;

  for (const group of userGroups) {
    const { id } = group;

    ctx.state.categoryGroups.user[id] = {
      id,
      name: group.name,
      position: group.position,
    };
  }

  const inflow = systemGroups.find((g) => g.name === "INFLOW");
  if (inflow) {
    ctx.state.categoryGroups.inflow = {
      id: inflow.id,
      name: inflow.name,
      position: inflow.position,
    };
  }

  const unc = systemGroups.find((g) => g.name === "UNCATEGORISED");
  if (unc) {
    ctx.state.categoryGroups.uncategorised = {
      id: unc.id,
      name: unc.name,
      position: unc.position,
    };
  }
};
