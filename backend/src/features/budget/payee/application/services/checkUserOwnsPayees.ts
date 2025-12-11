import { Prisma } from "@prisma/client";
import { PayeeNotFoundError } from "../../payee.errors";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";

/**
 * Verifies that one or more payees belong to the specified user.
 * Supports both single payee ID and array of payee IDs for efficient batch checking.
 *
 * @param tx - The Prisma transaction client
 * @param payeeIds - The ID(s) of the payee(s) to check (string or array of strings)
 * @param userId - The ID of the user who should own the payee(s)
 * @throws {PayeeNotFoundError} - If any payee doesn't exist or doesn't belong to the user
 */

export const checkUserOwnsPayees = async (
  tx: Prisma.TransactionClient,
  payeeIds: string | string[],
  userId: string
) => {
  const idsArray = Array.isArray(payeeIds) ? payeeIds : [payeeIds];

  const count = await payeeRepository.countPayeesByIdsAndUserId(
    tx,
    idsArray,
    userId
  );

  if (count !== idsArray.length) {
    throw new PayeeNotFoundError();
  }
};
