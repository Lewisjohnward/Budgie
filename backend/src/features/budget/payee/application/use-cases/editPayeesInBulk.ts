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
 *
 * This function enforces the following rules:
 * 1. All payees must belong to the specified user.
 * 2. System payees cannot be modified.
 *
 * Currently, the only supported field for bulk update is `includeInPayeeList`.
 * All operations are performed inside a single database transaction to ensure atomicity.
 *
 * @param payload - The payload containing bulk edit details.
 * @param payload.userId - ID of the user performing the operation.
 * @param payload.payeeIds - Array of payee IDs to update.
 * @param payload.updates.includeInPayeeList - Optional flag to show or hide payees in the payee list.
 *
 * @returns A promise that resolves once all payees have been updated.
 *
 * @throws {PayeeNotFoundError} - If one or more payees do not belong to the user.
 * @throws {CannotModifySystemPayeeError} - If attempting to edit system payees.
 */
export const editPayeesInBulk = async (
  payload: EditPayeesInBulkPayload
): Promise<void> => {
  const { userId, payeeIds, updates } = toEditPayeesInBulkCommand(payload);

  await prisma.$transaction(async (tx) => {
    // Verify user owns all payees
    await payeeService.checkUserOwnsPayees(tx, payeeIds, userId);

    // Prevent editing system payees
    await payeeService.assertNotSystemPayees(tx, userId, payeeIds);

    // Update all payees
    await payeeService.updatePayees(tx, payeeIds, updates);
  });
};
