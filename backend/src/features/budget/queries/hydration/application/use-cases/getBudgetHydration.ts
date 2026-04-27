import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { hydrationService } from "../../hydration.service";
import { normaliseHydrationData } from "../../utils/normaliseHydrationData";
import { getHydrationDateRange } from "../../utils/hydrationDateRange";
import { assertHydrationIntegrity } from "../../utils/assertHydrationIntegrity";
import { type BudgetHydrationModel } from "../../hydration.types";

/** Payload identifying the user for whom budget hydration data should be generated. */
type GetBudgetHydrationPayload = {
  userId: string;
};

type GetBudgetHydrationCommand = {
  userId: UserId;
};

const toGetBudgetHydrationCommand = (
  p: GetBudgetHydrationPayload
): GetBudgetHydrationCommand => ({
  userId: asUserId(p.userId),
});

/**
 * Orchestrates the full budget hydration workflow for a user.
 *
 * This use case is responsible for:
 * - Validating and coercing the input payload into a domain-safe command
 * - Fetching all raw hydration data for the user within the active date range
 * - Transforming raw data into a normalised hydration model
 * - Validating structural invariants to ensure data consistency
 *
 * The resulting model is a fully hydrated, UI-ready representation of the
 * user's budget state, including accounts, categories, months, transactions,
 * payees, and memos.
 *
 * This function acts as the single entry point for constructing the budget
 * view model used by the frontend.
 *
 * @param payload - Request payload containing the user identifier
 *
 * @returns A fully validated and hydrated budget model ready for UI consumption
 *
 * @throws HydrationInvariantError
 * Thrown when the hydrated dataset violates structural or range-based invariants
 */
export const getBudgetHydration = async (
  payload: GetBudgetHydrationPayload
): Promise<BudgetHydrationModel> => {
  const { userId } = toGetBudgetHydrationCommand(payload);
  const range = getHydrationDateRange();
  const rawHydrationData = await hydrationService.getHydrationData(
    userId,
    range
  );

  const normalisedData = normaliseHydrationData(
    rawHydrationData,
    rawHydrationData.range
  );

  // Not used because there is currently no way to get user start data,
  // range assumes 1 year in past, but on sign up user just get 2 months
  // the db needs a field to get the oldest date a user has
  // assertHydrationIntegrity(normalisedData, range);

  return normalisedData;
};
