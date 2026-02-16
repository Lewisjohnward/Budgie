import { type PayeeId } from "../../payee/payee.types";
import { type DomainNormalTransaction } from "../transaction.types";

/**
 * Returns a copy of a normal transaction, clearing its `payeeId` if it is a system payee.
 *
 * @param tx - The transaction to sanitize. If its `payeeId` is a system payee, it will be set to `undefined`.
 * @param systemPayeeIds - List of system payee IDs. Any matching `payeeId` on the transaction will be cleared.
 * @returns A new `DomainNormalTransaction` with `payeeId` cleared if it was a system payee.
 */
export const sanitizeSystemPayee = (
  tx: DomainNormalTransaction,
  systemPayeeIds: PayeeId[]
): DomainNormalTransaction => ({
  ...tx,
  payeeId:
    tx.payeeId && systemPayeeIds.includes(tx.payeeId) ? undefined : tx.payeeId,
});
