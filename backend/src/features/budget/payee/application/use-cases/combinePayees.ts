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
 *
 * Rules and behavior:
 * 1. The target payee must not be included in the list of payees to combine.
 * 2. All payees must belong to the specified user.
 * 3. System payees cannot be modified or deleted.
 * 4. Transactions linked to the combined payees are reassigned to the target payee.
 * 5. The combined payees are deleted; the target payee remains unchanged.
 *
 * All operations are performed within a single database transaction for atomicity.
 *
 * @param payload - The payload containing combine payees details.
 * @param payload.userId - ID of the user performing the operation.
 * @param payload.payeeIds - Array of payee IDs to combine (excluding the target).
 * @param payload.targetPayeeId - The ID of an existing payee to merge into (this payee remains).
 *
 * @returns A promise that resolves once the payees have been successfully combined.
 *
 * @throws {TargetPayeeIsInCombineList} - If the targetPayeeId is included in payeeIds (400).
 * @throws {PayeeNotFoundError} - If one or more payees do not belong to the user (404).
 * @throws {CannotModifySystemPayeeError} - If attempting to modify or delete a system payee (400).
 */
export const combinePayees = async (
  payload: CombinePayeesPayload
): Promise<void> => {
  const { userId, payeeIds, targetPayeeId } = toCombinePayeesCommand(payload);

  await prisma.$transaction(async (tx) => {
    if (payeeIds.includes(targetPayeeId)) {
      throw new TargetPayeeIsInCombineList();
    }

    await payeeService.checkUserOwnsPayees(
      tx,
      [...payeeIds, targetPayeeId],
      userId
    );

    await payeeService.assertNotSystemPayees(tx, userId, [
      ...payeeIds,
      targetPayeeId,
    ]);

    const payeesToDelete = payeeIds.filter((id) => id !== targetPayeeId);

    await transactionService.updatePayeeForTransactions(
      tx,
      userId,
      payeesToDelete,
      targetPayeeId
    );

    await payeeService.deletePayees(tx, payeesToDelete);
  });
};
