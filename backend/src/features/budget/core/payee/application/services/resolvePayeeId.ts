import { Prisma } from "@prisma/client";
import { checkUserOwnsPayees } from "./checkUserOwnsPayees";
import { checkPayeeNameIsUnique } from "./checkPayeeNameIsUnique";
import { createPayee } from "./createPayee";
import { type DomainPayee, type PayeeId } from "../../payee.types";
import { type UserId } from "../../../../../user/auth/auth.types";

type ResolvePayeeResult =
  | {
      type: "existing";
      payeeId: PayeeId;
    }
  | {
      type: "created";
      payeeId: PayeeId;
      createdPayee: DomainPayee;
    }
  | {
      type: "none";
    };

/**
 * Resolves the payee to use for a transaction, ensuring ownership and uniqueness.
 *
 * Workflow:
 * 1. If `payeeId` is provided:
 *    - Verifies that the user owns the payee using `checkUserOwnsPayees`.
 *    - Returns the validated `payeeId`.
 *    - Does not return a `createdPayee`, since no payee was created.
 * 2. If `payeeName` is provided (and `payeeId` is not):
 *    - Ensures no existing payee has the same name via `checkPayeeNameIsUnique`.
 *    - Creates a new payee with the given name using `createPayee`.
 *    - Returns both the newly created payee's ID and the `DomainPayee`.
 * 3. If neither `payeeId` nor `payeeName` is provided:
 *    - Returns an empty result.
 *
 * This function guarantees that any returned payee ID is valid and belongs to
 * the user, and provides the newly created payee when one is created.
 *
 * @param tx - Prisma transaction client used for database operations.
 * @param userId - ID of the user performing the operation.
 * @param payeeId - Optional existing payee ID to validate and use.
 * @param payeeName - Optional name for creating a new payee if `payeeId` is not provided.
 *
 * @returns An object containing:
 * - `payeeId` - The resolved payee ID, if a payee was specified.
 * - `createdPayee` - The newly created domain payee, if a new payee was created.
 *
 * @throws {PayeeNotFoundError} If `payeeId` is provided but the payee does not exist
 * or is not owned by the user.
 * @throws {PayeeAlreadyExistsError} If `payeeName` is provided but a payee with
 * that name already exists for the user.
 */
export const resolvePayeeId = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  payeeId?: PayeeId,
  payeeName?: string
): Promise<ResolvePayeeResult> => {
  if (payeeId) {
    await checkUserOwnsPayees(tx, payeeId, userId);

    return {
      type: "existing",
      payeeId,
    };
  }

  if (payeeName) {
    await checkPayeeNameIsUnique(tx, userId, payeeName);

    const createdPayee = await createPayee(tx, userId, payeeName);

    return {
      type: "created",
      payeeId: createdPayee.id,
      createdPayee,
    };
  }

  return { type: "none" };
};
