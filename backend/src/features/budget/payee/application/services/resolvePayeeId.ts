import { Prisma } from "@prisma/client";
import { checkUserOwnsPayees } from "./checkUserOwnsPayees";
import { checkPayeeNameIsUnique } from "./checkPayeeNameIsUnique";
import { createPayee } from "./createPayee";
import { type PayeeId } from "../../payee.types";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Resolves the payee ID to use for a transaction, ensuring ownership and uniqueness.
 *
 * Workflow:
 * 1. If `payeeId` is provided:
 *    - Verifies that the user owns the payee using `checkUserOwnsPayees`.
 *    - Returns the validated `payeeId`.
 * 2. If `payeeName` is provided (and `payeeId` is not):
 *    - Ensures no existing payee has the same name via `checkPayeeNameIsUnique`.
 *    - Creates a new payee with the given name using `createPayee`.
 *    - Returns the newly created payee's ID.
 * 3. If neither `payeeId` nor `payeeName` is provided:
 *    - Returns `undefined`.
 *
 * This function guarantees that the returned ID is valid and belongs to the user,
 * or creates a new payee if necessary.
 *
 * @param tx - Prisma transaction client used for database operations.
 * @param userId - ID of the user performing the operation.
 * @param payeeId - Optional existing payee ID to validate and use.
 * @param payeeName - Optional name for creating a new payee if `payeeId` is not provided.
 *
 * @returns The resolved `PayeeId` to use for the transaction, or `undefined` if no payee is specified.
 *
 * @throws {PayeeNotFoundError} - If `payeeId` is provided but the payee does not exist or is not owned by the user.
 * @throws {PayeeAlreadyExistsError} - If `payeeName` is provided but a payee with that name already exists for the user.
 */
export const resolvePayeeId = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  payeeId?: PayeeId,
  payeeName?: string
): Promise<PayeeId | undefined> => {
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
