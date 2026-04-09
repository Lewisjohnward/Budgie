import { prisma } from "../../../../../shared/prisma/client";
import { payeeService } from "../../payee.service";
import { categoryService } from "../../../category/core/category.service";
import { type EditPayeePayload } from "../../payee.schema";
import {
  asCategoryId,
  type CategoryId,
} from "../../../category/core/category.types";
import { asPayeeId, type PayeeId } from "../../payee.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

/**
 * Represents the payload for editing a payee, with a branded `CategoryId`.
 *
 * - Converts the `newDefaultCategoryId` from a string to a branded `CategoryId`.
 * - Preserves `null` if explicitly provided.
 * - Omits the original `newDefaultCategoryId` from `EditPayeePayload`.
 */
export type EditPayeeCommand = Omit<
  EditPayeePayload,
  "userId" | "payeeId" | "newDefaultCategoryId"
> & {
  userId: UserId;
  payeeId: PayeeId;
  newDefaultCategoryId?: CategoryId | null;
};

/**
 * Converts an `EditPayeePayload` into a command with branded types.
 *
 * - Ensures `newDefaultCategoryId` is either a branded `CategoryId`, `null`, or `undefined`.
 * - Allows downstream services to safely work with typed category IDs.
 *
 * @param payload - The raw edit payee payload from the API or caller.
 * @returns A new object with the `newDefaultCategoryId` properly branded.
 */
const toEditPayeeCommand = (p: EditPayeePayload): EditPayeeCommand => ({
  ...p,
  userId: asUserId(p.userId),
  payeeId: asPayeeId(p.payeeId),
  newDefaultCategoryId:
    p.newDefaultCategoryId === null
      ? null
      : p.newDefaultCategoryId
        ? asCategoryId(p.newDefaultCategoryId)
        : undefined,
});

/**
 * Edits a payee's details for a given user.
 *
 * This function allows updating the payee's:
 * - Name
 * - Default category
 * - Automatic categorization behavior
 * - Inclusion in the payee list
 *
 * The function enforces the following invariants:
 * - The payee must belong to the specified user.
 * - The payee must not be a system payee. Attempts to edit system payees
 *   will throw a `CannotModifySystemPayeeError`.
 * - The new payee name (if provided) must be unique for the user.
 * - The new default category (if provided) must exist and be owned by the user.
 *
 * All updates are performed within a single database transaction to ensure
 * atomicity.
 *
 * @param payload - The raw payload for editing the payee. This is converted
 *                  internally to `EditPayeeCommand` to enforce type branding.
 * @param payload.userId - The ID of the user performing the update.
 * @param payload.payeeId - The ID of the payee to edit.
 * @param payload.newName - Optional new name for the payee.
 * @param payload.newDefaultCategoryId - Optional new default category ID (branded) for the payee.
 * @param payload.automaticallyCategorisePayee - Optional flag to enable automatic categorization.
 * @param payload.includeInPayeeList - Optional flag to include/exclude the payee from the list.
 *
 * @returns A promise that resolves once the payee has been successfully updated.
 *
 * @throws {CannotModifySystemPayeeError} - If the payee is a system payee.
 * @throws Will throw an error if:
 *   - The payee does not belong to the user.
 *   - The new payee name is not unique.
 *   - The new default category does not exist or is not owned by the user.
 */
export const editPayee = async (payload: EditPayeePayload): Promise<void> => {
  const {
    userId,
    payeeId,
    newName,
    newDefaultCategoryId,
    automaticallyCategorisePayee,
    includeInPayeeList,
  } = toEditPayeeCommand(payload);

  await prisma.$transaction(async (tx) => {
    await payeeService.checkUserOwnsPayees(tx, payeeId, userId);

    await payeeService.assertNotSystemPayees(tx, userId, payeeId);

    if (newName) {
      await payeeService.checkPayeeNameIsUnique(tx, userId, newName, payeeId);
    }

    if (newDefaultCategoryId) {
      await categoryService.categories.getCategory(
        tx,
        userId,
        newDefaultCategoryId
      );
    }

    await payeeService.updatePayees(tx, payeeId, {
      name: newName,
      defaultCategoryId: newDefaultCategoryId,
      automaticallyCategorisePayee,
      includeInPayeeList,
    });
  });
};
