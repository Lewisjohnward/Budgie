import {
  type HydrationRawData,
  type BudgetHydrationModel,
} from "../hydration.types";
import { createBaseHydration } from "./createBaseHydration";
import { type HydrationDateRange } from "./hydrationDateRange";
import { mapAccounts } from "./mapAccounts";
import { mapCategories } from "./mapCategories";
import { mapCategoryGroups } from "./mapCategoryGroups";
import { mapMemos } from "./mapMemos";
import { mapMonths } from "./mapMonths";
import { mapPayees } from "./mapPayees";
import { mapTransactions } from "./mapTransactions";

/**
 * Internal context object used throughout the hydration pipeline.
 *
 * This context acts as the shared mutable container passed through each
 * mapping step in the hydration process.
 *
 * It provides:
 * 1. **input**
 *    - The raw, untransformed hydration payload from the backend
 *    - Treated as immutable source data

 * 2. **range**
 *    - The computed or provided date range for the hydration window
 *    - Used to initialise and constrain time-based structures (months, memos, etc.)

 * 3. **state**
 *    - The progressively built, normalised hydration model
 *    - Mutated in-place by each `map*` function during the pipeline
 *
 * Design intent:
 * - Keeps transformation logic functional in structure but imperative in execution
 * - Avoids repeated parameter passing between mapping functions
 * - Centralises all hydration-related data into a single orchestration object
 *
 * This is an internal construct and should not be exposed outside the hydration layer.
 */
export type HydrationContext = {
  input: HydrationRawData;
  range: HydrationDateRange;
  state: BudgetHydrationModel;
};

/**
 * Builds a fully normalised hydration model from raw budget data.
 *
 * This function orchestrates the hydration pipeline by:
 * - Initialising a base hydration state for the given date range
 * - Applying a sequence of mapping functions to populate domain entities
 * - Transforming raw input data into a structured, UI-ready format
 *
 * This function acts as the main entry point for the hydration process.
 *
 * @param data - Raw hydration data fetched from backend services
 * @param range - Date range defining the scope of time-based entities
 *
 * @returns A fully populated and normalised hydration model
 */
export const normaliseHydrationData = (
  data: HydrationRawData,
  range: HydrationDateRange
): BudgetHydrationModel => {
  const ctx: HydrationContext = {
    input: data,
    range,
    state: createBaseHydration(range),
  };

  mapCategoryGroups(ctx);
  mapCategories(ctx);
  mapAccounts(ctx);
  mapPayees(ctx);
  mapTransactions(ctx);
  mapMonths(ctx);
  mapMemos(ctx);

  return ctx.state;
};
