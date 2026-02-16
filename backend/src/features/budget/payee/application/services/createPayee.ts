import { Prisma } from "@prisma/client";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { DomainPayee } from "../../payee.types";
import { PayeeAlreadyExistsError } from "../../payee.errors";
import { payeeMapper } from "../../payee.mapper";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Creates a new payee for a specific user, ensuring domain invariants are preserved.
 *
 * Behaviour:
 * - Inserts a new payee record into the database via the repository.
 * - Maps the resulting database row to a domain-safe `DomainPayee` object.
 * - Ensures payee names are unique per user, throwing a `PayeeAlreadyExistsError` if violated.
 * - Allows specifying the origin of the payee (`USER` or `SYSTEM`).
 *
 * @param tx - Prisma transaction client for performing atomic operations.
 * @param userId - ID of the user who will own the new payee.
 * @param name - The name of the payee to create.
 * @param origin - Optional. Indicates whether the payee is created by the system or the user. Defaults to `"USER"`.
 *
 * @returns A promise resolving to the newly created `DomainPayee`.
 *
 * @throws {PayeeAlreadyExistsError} If a payee with the same name already exists for this user.
 * @throws {Prisma.PrismaClientKnownRequestError} If other known Prisma constraints fail.
 * @throws {Error} Any unexpected errors from Prisma or other layers.
 */
export const createPayee = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  name: string,
  origin: "USER" | "SYSTEM" = "USER"
): Promise<DomainPayee> => {
  try {
    const row = await payeeRepository.createPayee(tx, userId, name, origin);

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
