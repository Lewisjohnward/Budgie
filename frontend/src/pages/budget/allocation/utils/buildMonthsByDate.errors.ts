/**
 * Thrown when a MonthBranded resolves to a MonthKey
 * that is not present in the provided monthKeys list.
 *
 * This indicates a mismatch between backend data and expected time buckets.
 */
export class BuildMonthsByDateInvalidMonthKeyError extends Error {
  constructor(params: { monthId: string; derivedKey: string }) {
    super(
      `Invalid MonthKey derived for monthId=${params.monthId}: ` +
      `"${params.derivedKey}" is not in monthKeys`
    );

    this.name = "BuildMonthsByDateInvalidMonthKeyError";
  }
}
