import { extractSystemCategories } from "../../../core/category/core/utils/extractSytemCategories";
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
  const categoriesSplit = extractSystemCategories(ctx.input.categories);
  for (const category of categoriesSplit.user) {
    const { id } = category;

    ctx.state.categories.user[id] = {
      id,
      userId: category.userId,
      name: category.name,
      position: category.position,
      categoryGroupId: asCategoryGroupId(category.categoryGroupId),
    };
  }

  const rta = categoriesSplit.system["RTA"];
  if (rta) {
    const { id } = rta;

    ctx.state.categories.rta = {
      id,
      userId: rta.userId,
      name: rta.name,
      position: rta.position,
      categoryGroupId: asCategoryGroupId(rta.categoryGroupId),
    };
  }

  const unc = categoriesSplit.system["UNCATEGORISED"];
  if (unc) {
    const { id } = unc;

    ctx.state.categories.uncategorised = {
      id,
      userId: unc.userId,
      name: unc.name,
      position: unc.position,
      categoryGroupId: asCategoryGroupId(unc.categoryGroupId),
    };
  }
};
