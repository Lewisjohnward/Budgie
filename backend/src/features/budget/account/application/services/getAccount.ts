import { Prisma } from "@prisma/client";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { AccountNotFoundError } from "../../account.errors";

/**
 * Retrieves an account owned by the given user or throws if it does not exist.
 *
 * This is a guard-style helper that wraps the repository call and enforces
 * the invariant that the requested account must be owned by the user.
 * It is intended to be used inside transactional workflows where subsequent
 * operations assume a valid account.
 *
 * Notes:
 * - The lookup is scoped by `userId`; unowned accounts are treated as not found.
 * - The provided Prisma transaction client (`tx`) is used for consistency with
 *   surrounding operations.
 *
 * @param tx Prisma transaction client used to execute the query.
 * @param accountId The id of the account to retrieve.
 * @param userId The owner of the account.
 *
 * @returns The account record if found and owned by the user.
 *
 * @throws {AccountNotFoundError}
 * Thrown when no account exists for the given `accountId` and `userId`.
 */

export const getAccount = async (
  tx: Prisma.TransactionClient,
  accountId: string,
  userId: string
) => {
  const account = await accountRepository.getAccount(tx, accountId, userId);

  if (!account) {
    throw new AccountNotFoundError();
  }

  return account;
};
