import { prisma } from "../../../../../shared/prisma/client";
import { payeeService } from "../../payee.service";
import { categoryService } from "../../../category/category.service";
import { EditPayeePayload } from "../../payee.schema";

/**
 * Updates one or more fields of an existing payee.
 * At least one update field must be provided.
 *
 * @param payload - The edit payee payload
 * @param payload.userId - The ID of the user performing the operation
 * @param payload.payeeId - The ID of the payee to edit
 * @param payload.newName - Optional new name for the payee
 * @param payload.newDefaultCategoryId - Optional new default category ID (or null to clear)
 * @param payload.automaticallyCategorisePayee - Optional flag to enable/disable automatic categorization
 * @param payload.includeInPayeeList - Optional flag to show/hide payee in payee list
 * @throws {PayeeNotFoundError} - If user doesn't own the payee or category (404)
 * @throws {PayeeAlreadyExistsError} - If renaming to a name that already exists (409)
 */

export const editPayee = async (payload: EditPayeePayload) => {
  const {
    userId,
    payeeId,
    newName,
    newDefaultCategoryId,
    automaticallyCategorisePayee,
    includeInPayeeList,
  } = payload;

  await prisma.$transaction(async (tx) => {
    await payeeService.checkUserOwnsPayees(tx, payeeId, userId);

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
