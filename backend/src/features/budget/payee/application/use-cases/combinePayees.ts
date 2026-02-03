import { prisma } from "../../../../../shared/prisma/client";
import { payeeService } from "../../payee.service";
import { transactionService } from "../../../transaction/transaction.service";
import { CombinePayeesPayload } from "../../payee.schema";
import { TargetPayeeIsInCombineList } from "../../payee.errors";
import { asPayeeId, type PayeeId } from "../../payee.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

/**
 * Command type for combining payees.
 * Ensures all IDs are strongly typed with PayeeId.
 */
export type CombinePayeesCommand = Omit<
  CombinePayeesPayload,
  "userId" | "payeeIds" | "targetPayeeId"
> & {
  userId: UserId;
  payeeIds: PayeeId[];
  targetPayeeId: PayeeId;
};

/**
 * Converts a raw payload into a CombinePayeesCommand.
 * All payee IDs are cast to PayeeId.
 *
 * @param p - The original CombinePayeesPayload
 * @returns A strongly-typed CombinePayeesCommand
 */
export const toCombinePayeesCommand = (
  p: CombinePayeesPayload
): CombinePayeesCommand => ({
  ...p,
  userId: asUserId(p.userId),
  payeeIds: p.payeeIds.map(asPayeeId),
  targetPayeeId: asPayeeId(p.targetPayeeId),
});

/**
 * Combines multiple payees into a single existing target payee.
 * All transactions associated with the payees being combined will be reassigned to the target payee,
 * and the combined payees will be deleted. The target payee remains unchanged.
 *
 * @param payload - The combine payees payload
 * @param payload.userId - The ID of the user performing the operation
 * @param payload.payeeIds - Array of payee IDs to combine (must not include targetPayeeId)
 * @param payload.targetPayeeId - The ID of an existing payee to merge into (this payee will remain)
 * @throws {TargetPayeeIsInCombineList} - If targetPayeeId is included in payeeIds (400)
 * @throws {PayeeNotFoundError} - If user doesn't own one or more of the payees (404)
 */

export const combinePayees = async (payload: CombinePayeesPayload) => {
  const { userId, payeeIds, targetPayeeId } = toCombinePayeesCommand(payload);

  await prisma.$transaction(async (tx) => {
    // Fail early: verify target is not in the list of payees to combine
    if (payeeIds.includes(targetPayeeId)) {
      throw new TargetPayeeIsInCombineList();
    }

    // Verify user owns all payees (including target)
    await payeeService.checkUserOwnsPayees(
      tx,
      [...payeeIds, targetPayeeId],
      userId
    );

    // Get payees to delete (all except target)
    const payeesToDelete = payeeIds.filter((id) => id !== targetPayeeId);

    // Update all transactions at once to point to target payee
    await transactionService.updatePayeeForTransactions(
      tx,
      userId,
      payeesToDelete,
      targetPayeeId
    );

    // Delete all merged payees
    await payeeService.deletePayees(tx, payeesToDelete);
  });
};
