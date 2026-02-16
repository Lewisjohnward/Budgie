import { Prisma } from "@prisma/client";
import { AccountId } from "../../account.types";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { DuplicateAccountNameError } from "../../account.errors";

/**
 * Updates the name of an account.
 *
 * Ensures that account names remain unique by translating database
 * constraint violations into a domain-specific error.
 *
 * @param tx - Prisma transaction client
 * @param accountId - ID of the account to update
 * @param name - New name for the account
 *
 * @returns A promise that resolves once the account name has been updated
 *
 * @throws {DuplicateAccountNameError} If an account with the same name already exists
 * @throws {Error} Propagates any other database errors
 */
export const updateAccountName = async (
  tx: Prisma.TransactionClient,
  accountId: AccountId,
  name: string
) => {
  try {
    await accountRepository.updateAccountName(tx, accountId, name);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateAccountNameError();
    }

    throw error;
  }
};
