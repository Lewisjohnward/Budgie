import { Prisma } from "@prisma/client";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { PayeeAlreadyExistsError } from "../../payee.errors";

/**
 * Updates one or more payees with the same field values.
 * Supports both single payee ID and array of payee IDs for efficient batch updates.
 *
 * @param tx - The Prisma transaction client
 * @param payeeIds - The ID(s) of the payee(s) to update (string or array of strings)
 * @param data - The fields to update
 * @param data.name - Optional new name (only for single payee updates)
 * @param data.defaultCategoryId - Optional new default category ID
 * @param data.automaticallyCategorisePayee - Optional flag to enable/disable automatic categorization
 * @param data.includeInPayeeList - Optional flag to show/hide payee(s) in payee list
 * @throws {PayeeAlreadyExistsError} - If renaming to a name that already exists (P2002 race condition)
 */

export const updatePayees = async (
  tx: Prisma.TransactionClient,
  payeeIds: string | string[],
  data: {
    name?: string;
    defaultCategoryId?: string | null;
    automaticallyCategorisePayee?: boolean;
    includeInPayeeList?: boolean;
  }
): Promise<void> => {
  try {
    // Handle array of payee IDs - use batch update
    if (Array.isArray(payeeIds)) {
      // Note: name updates not supported for batch operations
      // as each payee must have a unique name
      await payeeRepository.updatePayees(tx, payeeIds, {
        includeInPayeeList: data.includeInPayeeList,
      });
      return;
    }

    // Handle single payee ID - use single update
    await payeeRepository.updatePayee(tx, payeeIds, data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new PayeeAlreadyExistsError();
      }
    }
    throw error;
  }
};
