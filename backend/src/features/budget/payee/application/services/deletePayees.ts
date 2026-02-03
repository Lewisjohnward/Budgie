import { Prisma } from "@prisma/client";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { type PayeeId } from "../../payee.types";

/**
 * Deletes multiple payees in a single database operation.
 *
 * @param tx - The Prisma transaction client
 * @param payeeIds - Array of payee IDs to delete
 */
export const deletePayees = async (
  tx: Prisma.TransactionClient,
  payeeIds: PayeeId[]
): Promise<void> => {
  await payeeRepository.deletePayees(tx, payeeIds);
};
