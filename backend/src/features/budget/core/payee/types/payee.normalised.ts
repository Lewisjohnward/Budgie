import { type DomainPayee, type PayeeId } from "./payee.domain";

/**
 * Represents a normalized collection of payees keyed by their ID.
 *
 * This structure allows for fast lookup of payees without iterating arrays.
 *
 * - `payees` – A map where each key is a `PayeeId` and the value is the corresponding `DomainPayee`.
 */
export type NormalisedPayees = {
  payees: Record<PayeeId, DomainPayee>;
};
