/**
 * Normalizes a Date to UTC midnight (00:00:00) and returns a new Date instance.
 *
 * This prevents timezone-related shifts when converting to ISO strings.
 * For example, a local date like "2025-08-01" in BST would normally become
 * "2025-07-31T23:00:00.000Z" when using toISOString(), which shifts the day.
 *
 * By forcing UTC midnight, the resulting ISO string will correctly represent
 * the intended calendar date:
 * "2025-08-01T00:00:00.000Z"
 *
 * Useful when working with date-only values (e.g. transactions, budgeting)
 * while still satisfying APIs that require full ISO datetime strings.
 *
 * @param Date date - The local Date object to normalize
 * @returns Date A new Date set to UTC midnight of the same calendar day
 */
export const normaliseDate = (d: Date) =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
