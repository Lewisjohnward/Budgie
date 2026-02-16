import { type Prisma } from "@prisma/client";
import { type UserId } from "../../../../user/auth/auth.types";
import { asPayeeId, type PayeeId } from "../../payee.types";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { SYSTEM_PAYEE_NAMES } from "../../payee.constants";
import { MissingSystemPayeesError } from "../../payee.errors";

/**
 * Retrieves the IDs of all system payees for a given user.
 *
 * System payees are predefined payees used internally by the system
 * (e.g., "Manual Balance Adjustment", "Starting Balance"). This function
 * ensures that all expected system payees exist for the user.
 *
 * @param {Prisma.TransactionClient} tx - The Prisma transaction client for database operations.
 * @param {UserId} userId - The ID of the user whose system payees are being fetched.
 *
 * @returns {Promise<PayeeId[]>} A promise that resolves to an array of `PayeeId`s corresponding
 *   to the user's system payees.
 *
 * @throws {MissingSystemPayeesError} Thrown if the user does not have all expected system payees.
 */
export async function getSystemPayeeIds(
  tx: Prisma.TransactionClient,
  userId: UserId
): Promise<PayeeId[]> {
  const ids = await payeeRepository.getSystemPayeeIdsByUserId(tx, userId);
  if (ids.length !== SYSTEM_PAYEE_NAMES.length) {
    throw new MissingSystemPayeesError();
  }

  return ids.map(asPayeeId);
}
