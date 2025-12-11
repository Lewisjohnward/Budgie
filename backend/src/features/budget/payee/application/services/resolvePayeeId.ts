import { Prisma } from "@prisma/client";
import { checkUserOwnsPayees } from "./checkUserOwnsPayees";
import { checkPayeeNameIsUnique } from "./checkPayeeNameIsUnique";
import { createPayee } from "./createPayee";

/**
 * Resolves the payee ID to use for a transaction
 *
 * If a payeeId is provided, validates that the user owns it.
 * If a payeeName is provided, validates uniqueness and creates a new payee.
 * Returns undefined if neither is provided.
 *
 * @param tx - The Prisma transaction client
 * @param userId - The ID of the user
 * @param payeeId - Optional ID of an existing payee to use
 * @param payeeName - Optional name for a new payee to create
 * @returns The resolved payee ID, or undefined if no payee is specified
 * @throws {PayeeNotFoundError} - If the provided payeeId doesn't exist or doesn't belong to the user
 * @throws {PayeeAlreadyExistsError} - If the provided payeeName already exists for the user
 */

export const resolvePayeeId = async (
  tx: Prisma.TransactionClient,
  userId: string,
  payeeId?: string,
  payeeName?: string
): Promise<string | undefined> => {
  if (payeeId) {
    await checkUserOwnsPayees(tx, payeeId, userId);
    return payeeId;
  }

  if (payeeName) {
    await checkPayeeNameIsUnique(tx, userId, payeeName);
    const payeeCreated = await createPayee(tx, userId, payeeName);
    return payeeCreated.id;
  }

  return undefined;
};
