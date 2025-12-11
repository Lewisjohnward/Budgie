import { Prisma } from "@prisma/client";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { Payee } from "../../payee.types";
import { PayeeAlreadyExistsError } from "../../payee.errors";

/**
 * Creates a new payee for a user
 *
 * @param tx - The Prisma transaction client
 * @param userId - The ID of the user who will own the payee
 * @param name - The name of the payee to create
 * @returns The newly created payee object
 * @throws {PayeeAlreadyExistsError} - If a payee with this name already exists (P2002 race condition)
 */

export const createPayee = async (
  tx: Prisma.TransactionClient,
  userId: string,
  name: string
): Promise<Payee> => {
  try {
    return await payeeRepository.createPayee(tx, userId, name);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new PayeeAlreadyExistsError();
      }
    }
    throw error;
  }
};
