import { Prisma } from "@prisma/client";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { DomainPayee } from "../../payee.types";
import { PayeeAlreadyExistsError } from "../../payee.errors";
import { payeeMapper } from "../../payee.mapper";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Creates a new payee for a specific user.
 *
 * This function:
 * - Inserts a new payee record into the database.
 * - Maps the database row to a domain-safe `DomainPayee` object.
 * - Ensures that payee names are unique per user.
 *
 * @param tx - The Prisma transaction client used for atomic database operations.
 * @param userId - The ID of the user who will own the new payee.
 * @param name - The name of the payee to create.
 *
 * @returns A promise that resolves to the newly created `DomainPayee`.
 *
 * @throws {PayeeAlreadyExistsError} Thrown if a payee with the same name already exists for this user.
 * @throws {Error} Any other errors from the Prisma client are propagated as-is.
 */

export const createPayee = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  name: string
): Promise<DomainPayee> => {
  try {
    const row = await payeeRepository.createPayee(tx, userId, name);

    return payeeMapper.toDomainPayee(row);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new PayeeAlreadyExistsError();
      }
    }
    throw error;
  }
};
