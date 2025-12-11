import { TransactionDateTooOldError } from "../transaction.errors";

/**
 * Enforce "12-month window" when the caller is actively setting a date.
 * "12 months" is interpreted as calendar months: current month + 11 previous months.
 */
export function assertTransactionDateWithinLast12Months(
  date: Date,
  now = new Date()
) {
  // Earliest allowed = first day of the month, 11 months ago (UTC).
  // Example: if now is 2026-01-31, earliestAllowed is 2025-02-01T00:00:00.000Z
  const earliestAllowed = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)
  );

  if (date < earliestAllowed) {
    throw new TransactionDateTooOldError(
      `Transaction date must be within the last 12 months (earliest allowed: ${earliestAllowed.toISOString()})`
    );
  }
}
