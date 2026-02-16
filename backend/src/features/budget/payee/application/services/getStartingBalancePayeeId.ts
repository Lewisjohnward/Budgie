import { type Prisma } from "@prisma/client";
import { type UserId } from "../../../../user/auth/auth.types";
import { asPayeeId, type PayeeId } from "../../payee.types";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { MissingSystemPayeesError } from "../../payee.errors";

/**
 * Retrieves the `PayeeId` for the user's "Starting Balance" system payee.
 *
 * This function ensures that the required system payee exists for the given user.
 * If the payee cannot be found, it throws a `MissingSystemPayeesError`.
 *
 * @param tx - Prisma transaction client used for the database query.
 * @param userId - The ID of the user whose "Starting Balance" payee is being retrieved.
 *
 * @returns The `PayeeId` corresponding to the "Starting Balance" system payee.
 *
 * @throws {MissingSystemPayeesError} If the "Starting Balance" payee does not exist for the user.
 */
export async function getStartingBalancePayeeId(
  tx: Prisma.TransactionClient,
  userId: UserId
): Promise<PayeeId> {
  const startingBalancePayeeId =
    await payeeRepository.getStartingBalancePayeeId(tx, userId);

  if (!startingBalancePayeeId) {
    throw new MissingSystemPayeesError();
  }

  return asPayeeId(startingBalancePayeeId);
}
