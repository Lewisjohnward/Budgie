import { type PayeeDto, type DomainPayee } from "../payee.types";

/**
 * Maps a domain payee entity into a DTO suitable for API responses.
 *
 * This function removes domain-only concerns
 * and converts branded identifiers into plain string values for transport.
 *
 * It ensures the frontend receives a clean, serialisable representation of a payee
 * without leaking internal domain structure or persistence details.
 *
 * @param payee - The domain payee entity.
 * @returns A DTO representation of the payee for client consumption.
 */
export const toPayeeDto = (payee: DomainPayee): PayeeDto => {
  return {
    id: payee.id,
    name: payee.name,
    origin: payee.origin,
    defaultCategoryId: payee.defaultCategoryId,
    includeInPayeeList: payee.includeInPayeeList,
    automaticallyCategorisePayee: payee.automaticallyCategorisePayee,
  };
};
