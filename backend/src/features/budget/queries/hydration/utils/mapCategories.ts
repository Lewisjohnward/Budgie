import { asCategoryGroupId } from "../../../core/categorygroup/categoryGroup.types";
import { type HydrationContext } from "./normaliseHydrationData";

/**
 * Maps raw category data into the hydration state.
 *
 * This function:
 * - Separates user-defined and system categories
 * - Normalises and indexes user categories by ID
 * - Assigns system categories (RTA, uncategorised) into dedicated slots
 * - Ensures categoryGroupId values are properly typed and consistent
 *
 * The resulting structure is optimised for UI usage, with fast lookup
 * for user categories and explicit handling of system-defined categories.
 *
 * @param ctx - Hydration context containing raw input data and mutable
 * hydration state being constructed
 *
 * @returns void (mutates hydration state in place)
 */
export const mapCategories = (ctx: HydrationContext): void => {
  for (const category of ctx.input.userCategories) {
    const { id } = category;

    ctx.state.categories.user[id] = {
      id,
      name: category.name,
      position: category.position,
      categoryGroupId: asCategoryGroupId(category.categoryGroupId),
    };
  }

  ctx.state.categories.rta = ctx.input.systemCategories.rta;

  ctx.state.categories.uncategorised = ctx.input.systemCategories.uncategorised;
};
