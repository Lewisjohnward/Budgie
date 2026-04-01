import { Prisma } from "@prisma/client";
import { type UserId } from "../../../../user/auth/auth.types";
import { CannotModifySystemPayeeError } from "../../payee.errors";
import { type PayeeId } from "../../payee.types";
import { getSystemPayeeIds } from "./getSystemPayeeIds";

/**
 * Asserts that one or more payees are not system payees for a given user.
 *
 * This function is used to enforce the invariant that system payees
 * cannot be modified or deleted. It supports both a single payee ID
 * or an array of payee IDs.
 *
 * @param tx - A Prisma transaction client for database operations.
 * @param userId - The ID of the user performing the operation.
 * @param payeeIds - A single payee ID or an array of payee IDs to check.
 *
 * @returns A promise that resolves if none of the payee IDs are system payees.
 *
 * @throws {CannotModifySystemPayeeError} - If any of the provided payee IDs
 *                                           correspond to system payees.
 */
export const assertNotSystemPayees = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  payeeIds: PayeeId | PayeeId[]
): Promise<void> => {
  const ids = Array.isArray(payeeIds) ? payeeIds : [payeeIds];
  const systemPayeeIds = await getSystemPayeeIds(tx, userId);
  const intersection = ids.filter((id) => systemPayeeIds.includes(id));

  if (intersection.length > 0) {
    throw new CannotModifySystemPayeeError();
  }
};
