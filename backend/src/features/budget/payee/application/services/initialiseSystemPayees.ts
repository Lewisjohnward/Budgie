import { type Prisma } from "@prisma/client";
import { type UserId } from "../../../../user/auth/auth.types";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { SYSTEM_PAYEE_NAMES } from "../../payee.constants";

/**
 * Creates all required system payees for a given user.
 *
 * This function ensures that the user has the standard system payees
 * defined in `SYSTEM_PAYEE_NAMES`. Each payee is created with an origin
 * of `"SYSTEM"`.
 *
 * @param tx - The Prisma transaction client used for database operations.
 * @param userId - The ID of the user for whom the system payees are being created.
 *
 * @returns A promise that resolves once all system payees have been inserted.
 */
export async function initialiseSystemPayees(
  tx: Prisma.TransactionClient,
  userId: UserId
): Promise<void> {
  const systemPayees = SYSTEM_PAYEE_NAMES.map((name) => ({
    name,
    origin: "SYSTEM" as const,
  }));

  await payeeRepository.createPayees(tx, userId, systemPayees);
}
