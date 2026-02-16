import { type Prisma } from "@prisma/client";
import { type UserId } from "../../../../user/auth/auth.types";
import { asPayeeId, PayeeId } from "../../payee.types";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { MissingSystemPayeesError } from "../../payee.errors";

/**
 * Retrieves the `PayeeId` for the user's "Balance Adjustment" system payee.
 *
 * Ensures that the required system payee exists for the specified user.
 * If the payee cannot be found, a `MissingSystemPayeesError` is thrown.
 *
 * @param tx - Prisma transaction client used for the database query.
 * @param userId - The ID of the user whose "Balance Adjustment" payee is being retrieved.
 *
 * @returns The `PayeeId` corresponding to the "Balance Adjustment" system payee.
 *
 * @throws {MissingSystemPayeesError} If the "Balance Adjustment" payee does not exist for the user.
 */
export async function getBalanceAdjustmentPayeeId(
  tx: Prisma.TransactionClient,
  userId: UserId
): Promise<PayeeId> {
  const balanceAdjustmentPayeeId =
    await payeeRepository.getBalanceAdjustmentPayeeId(tx, userId);

  if (!balanceAdjustmentPayeeId) {
    throw new MissingSystemPayeesError();
  }

  return asPayeeId(balanceAdjustmentPayeeId);
}
