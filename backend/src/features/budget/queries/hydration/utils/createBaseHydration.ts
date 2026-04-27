import { type CategoryId } from "../../../core/category/core/category.types";
import { type CategoryGroupId } from "../../../core/categorygroup/categoryGroup.types";
import { type BudgetHydrationModel } from "../hydration.types";
import { buildMonthKeysFromRange } from "./buildMonthKeysFromRange";
import { type HydrationDateRange } from "./hydrationDateRange";

/**
 * Creates the initial empty hydration state for a given date range.
 *
 * This establishes the baseline structure used during the hydration process,
 * including pre-populated system category groups and categories (e.g. inflow,
 * uncategorised, RTA), empty entity maps, and the computed list of month keys
 * derived from the provided range.
 *
 * The returned object is intended to be incrementally populated by mapping
 * functions during normalisation.
 *
 * @param range - Date range used to generate the ordered set of month keys
 *
 * @returns An initialised hydration model ready to be filled with normalised data
 */
export const createBaseHydration = (
  range: HydrationDateRange
): BudgetHydrationModel => ({
  categoryGroups: {
    user: {},
    inflow: {
      id: "inflow" as CategoryGroupId,
      name: "Inflow",
      position: 0,
    },
    uncategorised: {
      id: "uncategorised" as CategoryGroupId,
      name: "Uncategorised",
      position: 0,
    },
  },
  categories: {
    user: {},
    rta: {
      id: "rta" as CategoryId,
      name: "RTA",
      position: 0,
      categoryGroupId: "inflow" as CategoryGroupId,
    },
    uncategorised: {
      id: "uncategorised" as CategoryId,
      name: "Uncategorised",
      position: 0,
      categoryGroupId: "uncategorised" as CategoryGroupId,
    },
  },
  months: {},
  accounts: {},
  transactions: {},
  payees: {},
  memosByMonth: {},
  monthKeys: buildMonthKeysFromRange(range.from, range.to),
});
