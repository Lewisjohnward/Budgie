import { prisma } from "../../../../../shared/prisma/client";
import { payeeService } from "../../payee.service";
import { transactionService } from "../../../transaction/transaction.service";
import { DeletePayeesInBulkPayload } from "../../payee.schema";
import { ReplacementPayeeIsInDeleteList } from "../../payee.errors";

/**
 * Deletes multiple payees in bulk and updates all associated transactions.
 * If a replacement payee is provided, all transactions will be reassigned to it.
 * Otherwise, transactions will have their payeeId set to null.
 *
 * @param payload - The delete payees in bulk payload
 * @param payload.userId - The ID of the user performing the operation
 * @param payload.payeeIds - Array of payee IDs to delete
 * @param payload.replacementPayeeId - Optional ID of an existing payee to reassign transactions to (must not be in payeeIds)
 * @throws {ReplacementPayeeIsInDeleteList} - If replacementPayeeId is included in payeeIds (400)
 * @throws {PayeeNotFoundError} - If user doesn't own one or more of the payees (404)
 */

export const deletePayeesInBulk = async (
  payload: DeletePayeesInBulkPayload
) => {
  const { userId, payeeIds, replacementPayeeId } = payload;

  await prisma.$transaction(async (tx) => {
    // Fail early: check replacement payee isn't in delete list
    if (replacementPayeeId && payeeIds.includes(replacementPayeeId)) {
      throw new ReplacementPayeeIsInDeleteList();
    }

    // Verify user owns all payees (and replacement payee if provided)
    const payeesToCheck = replacementPayeeId
      ? [...payeeIds, replacementPayeeId]
      : payeeIds;

    await payeeService.checkUserOwnsPayees(tx, payeesToCheck, userId);

    // Update all transactions at once
    await transactionService.updatePayeeForTransactions(
      tx,
      userId,
      payeeIds,
      replacementPayeeId ?? null
    );

    // Delete all payees
    await payeeService.deletePayees(tx, payeeIds);
  });
};
