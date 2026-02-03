import { prisma } from "../../../../../shared/prisma/client";
import { payeeService } from "../../payee.service";
import { type EditPayeesInBulkPayload } from "../../payee.schema";
import { asPayeeId, type PayeeId } from "../../payee.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

/**
 * Command type for editing multiple payees in bulk.
 * Ensures all IDs are strongly branded.
 */
export type EditPayeesInBulkCommand = Omit<
  EditPayeesInBulkPayload,
  "userId" | "payeeIds"
> & {
  userId: UserId;
  payeeIds: PayeeId[];
};

/**
 * Converts a raw payload into a strongly-typed EditPayeesInBulkCommand.
 *
 * @param p - The original EditPayeesInBulkPayload
 * @returns A strongly-typed command with all payeeIds branded
 */

export const toEditPayeesInBulkCommand = (
  p: EditPayeesInBulkPayload
): EditPayeesInBulkCommand => ({
  ...p,
  userId: asUserId(p.userId),
  payeeIds: p.payeeIds.map(asPayeeId),
});

/**
 * Updates multiple payees in bulk with the same field values.
 * Currently only supports updating the includeInPayeeList field.
 * At least one update field must be provided.
 *
 * @param payload - The edit payees in bulk payload
 * @param payload.userId - The ID of the user performing the operation
 * @param payload.payeeIds - Array of payee IDs to update
 * @param payload.updates - Object containing the fields to update
 * @param payload.updates.includeInPayeeList - Optional flag to show/hide payees in payee list
 * @throws {PayeeNotFoundError} - If user doesn't own one or more of the payees (404)
 */

export const editPayeesInBulk = async (payload: EditPayeesInBulkPayload) => {
  const { userId, payeeIds, updates } = toEditPayeesInBulkCommand(payload);

  await prisma.$transaction(async (tx) => {
    // Verify user owns all payees
    await payeeService.checkUserOwnsPayees(tx, payeeIds, userId);

    // Update all payees
    await payeeService.updatePayees(tx, payeeIds, updates);
  });
};
