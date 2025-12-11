import { prisma } from "../../../../../shared/prisma/client";
import { payeeService } from "../../payee.service";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { transactionService } from "../../../transaction/transaction.service";
import { DeletePayeePayload } from "../../payee.schema";

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
  const { userId, payeeId, replacementPayeeId } = payload;

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
