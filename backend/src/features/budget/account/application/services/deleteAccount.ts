import { Prisma } from "@prisma/client";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { AccountId } from "../../account.types";

/**
 * Deletes an account from the database.
 *
 * This function removes the account record with the specified ID.
 * It should be executed within a database transaction to ensure consistency,
 * typically after all associated transactions have been handled.
 *
 * @param tx - Prisma transaction client used for database operations
 * @param accountId - ID of the account to delete
 *
 * @returns A promise that resolves when the account has been successfully deleted
 */
export const deleteAccount = async (
  tx: Prisma.TransactionClient,
  accountId: AccountId
) => {
  await accountRepository.deleteAccount(tx, accountId);
};
