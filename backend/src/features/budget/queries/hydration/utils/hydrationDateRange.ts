export type HydrationDateRange = {
  from: Date;
  to: Date;
};

/**
 * Returns a UTC-based rolling 12-month date range for hydration, from the start of the month 11 months ago (inclusive)
 * to the start of next month (exclusive).
 */
export function getHydrationDateRange(): HydrationDateRange {
  const now = new Date();

  const from = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)
  );

  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return { from, to };
}
