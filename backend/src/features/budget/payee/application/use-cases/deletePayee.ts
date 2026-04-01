import { prisma } from "../../../../../shared/prisma/client";
import { payeeService } from "../../payee.service";
import { transactionService } from "../../../transaction/transaction.service";
import { DeletePayeePayload } from "../../payee.schema";
import { asPayeeId, type PayeeId } from "../../payee.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

type DeletePayeeCommand = Omit<
  DeletePayeePayload,
  "userId" | "payeeId" | "replacementPayeeId"
> & {
  userId: UserId;
  payeeId: PayeeId;
  replacementPayeeId?: PayeeId | null;
};

/**
 * Converts a raw DeletePayeePayload into a DeletePayeeCommand
 * with a branded PayeeId.
 *
 * @param p - The original delete payee payload
 * @returns A payload with payeeId cast as a PayeeId
 */
export const toDeletePayeeCommand = (
  p: DeletePayeePayload
): DeletePayeeCommand => ({
  ...p,
  userId: asUserId(p.userId),
  payeeId: asPayeeId(p.payeeId),
  replacementPayeeId:
    p.replacementPayeeId === null
      ? null
      : p.replacementPayeeId
        ? asPayeeId(p.replacementPayeeId)
        : undefined,
});

/**
 * Deletes a payee and reassigns or clears associated transactions.
 *
 * This function enforces the following rules:
 * 1. The payee must belong to the specified user.
 * 2. The replacement payee (if provided) must belong to the user.
 * 3. System payees cannot be deleted.
 *
 * All operations are performed inside a single database transaction to
 * ensure atomicity.
 *
 * @param payload - The raw payload for deleting a payee. Internally converted to a branded `DeletePayeeCommand`.
 * @param payload.userId - The ID of the user performing the deletion.
 * @param payload.payeeId - The ID of the payee to delete.
 * @param payload.replacementPayeeId - Optional ID of an existing payee to reassign transactions to.
 *
 * @returns A promise that resolves once the payee has been deleted and transactions updated.
 *
 * @throws {PayeeNotFoundError} - If the payee or replacement payee does not belong to the user.
 * @throws {CannotModifySystemPayeeError} - If attempting to delete a system payee.
 */
export const deletePayee = async (
  payload: DeletePayeePayload
): Promise<void> => {
  const { userId, payeeId, replacementPayeeId } = toDeletePayeeCommand(payload);

  await prisma.$transaction(async (tx) => {
    // Verify user owns payee (and replacement payee if provided)
    const payeesToCheck = replacementPayeeId
      ? [payeeId, replacementPayeeId]
      : payeeId;

    await payeeService.checkUserOwnsPayees(tx, payeesToCheck, userId);

    // Prevent deleting system payees
    await payeeService.assertNotSystemPayees(tx, userId, payeeId);

    await transactionService.updatePayeeForTransactions(
      tx,
      userId,
      payeeId,
      replacementPayeeId ?? null
    );

    await payeeService.deletePayees(tx, [payeeId]);
  });
};
