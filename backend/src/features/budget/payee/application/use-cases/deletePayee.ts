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
 * Deletes a payee and updates all associated transactions.
 * If a replacement payee is provided, all transactions will be reassigned to it.
 * Otherwise, transactions will have their payeeId set to null.
 *
 * @param payload - The delete payee payload
 * @param payload.userId - The ID of the user performing the operation
 * @param payload.payeeId - The ID of the payee to delete
 * @param payload.replacementPayeeId - Optional ID of an existing payee to reassign transactions to
 * @throws {PayeeNotFoundError} - If user doesn't own the payee or replacement payee (404)
 */

export const deletePayee = async (payload: DeletePayeePayload) => {
  const { userId, payeeId, replacementPayeeId } = toDeletePayeeCommand(payload);

  await prisma.$transaction(async (tx) => {
    // Verify user owns payee (and replacement payee if provided)
    const payeesToCheck = replacementPayeeId
      ? [payeeId, replacementPayeeId]
      : payeeId;

    await payeeService.checkUserOwnsPayees(tx, payeesToCheck, userId);

    await transactionService.updatePayeeForTransactions(
      tx,
      userId,
      payeeId,
      replacementPayeeId ?? null
    );

    await payeeService.deletePayees(tx, [payeeId]);
  });
};
