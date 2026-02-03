import { prisma } from "../../../../../shared/prisma/client";
import { payeeService } from "../../payee.service";
import { transactionService } from "../../../transaction/transaction.service";
import { DeletePayeesInBulkPayload } from "../../payee.schema";
import { ReplacementPayeeIsInDeleteList } from "../../payee.errors";
import { asPayeeId, type PayeeId } from "../../payee.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

/**
 * Command type for deleting multiple payees in bulk.
 * Ensures all payee IDs are strongly typed with PayeeId.
 */
export type DeletePayeesInBulkCommand = Omit<
  DeletePayeesInBulkPayload,
  "userId" | "payeeIds" | "replacementPayeeId"
> & {
  userId: UserId;
  payeeIds: PayeeId[];
  replacementPayeeId?: PayeeId;
};

/**
 * Converts a raw payload into a DeletePayeesInBulkCommand.
 * All payee IDs are cast to PayeeId.
 *
 * @param p - The original DeletePayeesInBulkPayload
 * @returns A strongly-typed DeletePayeesInBulkCommand
 */
export const toDeletePayeesInBulkCommand = (
  p: DeletePayeesInBulkPayload
): DeletePayeesInBulkCommand => ({
  ...p,
  userId: asUserId(p.userId),
  payeeIds: p.payeeIds.map(asPayeeId),
  replacementPayeeId: p.replacementPayeeId
    ? asPayeeId(p.replacementPayeeId)
    : undefined,
});

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
  const { userId, payeeIds, replacementPayeeId } =
    toDeletePayeesInBulkCommand(payload);

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
