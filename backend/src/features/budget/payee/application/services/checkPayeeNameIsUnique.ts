import { Prisma } from "@prisma/client";
import { PayeeAlreadyExistsError } from "../../payee.errors";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { type PayeeId } from "../../payee.types";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Checks if a payee name is unique for a specific user
 *
 * @param tx - The Prisma transaction client
 * @param userId - The ID of the user who owns the payee
 * @param name - The name of the payee to check for uniqueness
 * @param excludePayeeId - Optional ID of a payee to exclude from the uniqueness check (for updates)
 * @throws {PayeeAlreadyExistsError} - If a payee with the same name already exists for the user
 */
export const checkPayeeNameIsUnique = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  name: string,
  excludePayeeId?: PayeeId
) => {
  const existingPayee = await payeeRepository.getPayeeByNameAndUserId(
    tx,
    userId,
    name,
    excludePayeeId
  );

  if (existingPayee) {
    throw new PayeeAlreadyExistsError();
  }
};
