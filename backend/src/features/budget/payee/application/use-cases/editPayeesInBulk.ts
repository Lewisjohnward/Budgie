import { prisma } from "../../../../../shared/prisma/client";
import { payeeService } from "../../payee.service";
import { EditPayeesInBulkPayload } from "../../payee.schema";

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
  const { userId, payeeIds, updates } = payload;

  await prisma.$transaction(async (tx) => {
    // Verify user owns all payees
    await payeeService.checkUserOwnsPayees(tx, payeeIds, userId);

    // Update all payees
    await payeeService.updatePayees(tx, payeeIds, updates);
  });
};
