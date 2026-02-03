import {
  type PayeeId,
  type DomainPayee,
  type NormalisedPayees,
} from "../payee.types";

/**
 * Converts a list of payees into a normalized structure for fast lookup.
 *
 * Each payee is keyed by its `id`, making it easy to access payee data
 * without iterating over an array.
 *
 * @param payees - Array of domain payees to normalize
 * @returns An object containing a map of payees keyed by their ID
 *
 * @example
 * const payeesArray = [
 *   { id: "p1", name: "Alice", userId: "u1", defaultCategoryId: null, includeInPayeeList: true, automaticallyCategorisePayee: false },
 *   { id: "p2", name: "Bob", userId: "u1", defaultCategoryId: "c1", includeInPayeeList: true, automaticallyCategorisePayee: true },
 * ];
 *
 * const normalized = normalisePayees(payeesArray);
 * console.log(normalized.payees["p1"].name); // "Alice"
 */
export function normalisePayees(payees: DomainPayee[]): NormalisedPayees {
  const payeeMap: Record<PayeeId, DomainPayee> = {};

  const normalisedPayees = payees.reduce((acc, payee) => {
    acc[payee.id] = payee;
    return acc;
  }, payeeMap);

  return {
    payees: normalisedPayees,
  };
}
