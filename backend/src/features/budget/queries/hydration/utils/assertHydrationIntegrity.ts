import { HydrationInvariantError } from "../hydration.errors";
import {
  type BudgetHydrationModel,
  type NormalisedMonth,
} from "../hydration.types";
import { buildMonthKeysFromRange } from "./buildMonthKeysFromRange";
import { type HydrationDateRange } from "./hydrationDateRange";
import { toMonthKey } from "./toMonthKey";

/**
 * Validates the integrity of a fully hydrated budget model.
 *
 * This function performs a series of strict invariant checks to ensure that
 * the hydration process produced a consistent and complete dataset.
 *
 * The checks include:
 * - Ensuring every expected month in the requested range has an associated memo
 * - Ensuring every expected month exists in the months collection
 * - Ensuring no months exist outside the requested date range
 * - Ensuring each category has exactly one month entry per month key
 * - Detecting duplicate month entries for the same category + month combination
 *
 * These invariants guarantee that the hydrated model is structurally sound
 * and safe for UI consumption without additional defensive checks.
 *
 * @param normalisedData - Fully hydrated budget model to validate
 * @param range - Date range used to define the expected set of month keys
 *
 * @throws HydrationInvariantError
 * Thrown when any structural inconsistency is detected, including:
 * - missing data
 * - duplicate entries
 * - out-of-range entities
 *
 * @returns void
 * (Returns the original model if all invariants pass; otherwise throws)
 */
export const assertHydrationIntegrity = (
  normalisedData: BudgetHydrationModel,
  range: HydrationDateRange
): void => {
  const monthKeys = buildMonthKeysFromRange(range.from, range.to);
  const expectedKeys = new Set(monthKeys);

  const memoKeys = new Set(Object.keys(normalisedData.memosByMonth));
  const dataMonthKeys = new Set<string>();
  const monthIndex = new Map<string, NormalisedMonth>();

  /**
   * -------------------------
   * INVARIANT CHECKS
   * -------------------------
   */
  for (const m of Object.values(normalisedData.months)) {
    const monthKey = toMonthKey(m.month);

    dataMonthKeys.add(monthKey);

    const key = `${m.categoryId}-${monthKey}`;

    if (monthIndex.has(key)) {
      throw new HydrationInvariantError(
        `Duplicate month for ${key}`,
        "DUPLICATE_DATA"
      );
    }

    monthIndex.set(key, m);
  }

  // -------------------------
  // RANGE VALIDATION (MEMOS + MONTHS EXISTENCE)
  // -------------------------
  for (const key of monthKeys) {
    // Ensure that each monthKey corresponds to a memo
    if (!memoKeys.has(key)) {
      throw new HydrationInvariantError(
        `Missing memo for monthKey: ${key}`,
        "MISSING_DATA"
      );
    }

    // Ensure that each monthKey corresponds to a month
    if (!dataMonthKeys.has(key)) {
      throw new HydrationInvariantError(
        `Missing month data for monthKey: ${key}`,
        "MISSING_DATA"
      );
    }
  }

  // -------------------------
  // OUT OF RANGE CHECK
  // -------------------------
  for (const key of dataMonthKeys) {
    // Ensure that there aren't months outside the range
    if (!expectedKeys.has(key)) {
      throw new HydrationInvariantError(
        `Unexpected month outside snapshot range: ${key}`,
        "OUT_OF_RANGE"
      );
    }
  }

  // -------------------------
  // CATEGORY × MONTH COMPLETENESS
  // -------------------------
  const categoryIds = [
    ...Object.keys(normalisedData.categories.user),
    normalisedData.categories.rta.id,
    normalisedData.categories.uncategorised.id,
  ];

  // Ensure that there is a single month for each category per monthKey
  for (const categoryId of categoryIds) {
    for (const monthKey of monthKeys) {
      const key = `${categoryId}-${monthKey}`;

      if (!monthIndex.has(key)) {
        throw new HydrationInvariantError(
          `Missing month for category ${categoryId} and month ${monthKey}`,
          "MISSING_DATA"
        );
      }
    }
  }
};
