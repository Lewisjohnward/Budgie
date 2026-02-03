import { Prisma } from "@prisma/client";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { AccountNotFoundError } from "../../account.errors";
import { type DomainAccount, type AccountId } from "../../account.types";
import { accountMapper } from "../../account.mapper";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Retrieves a single account owned by a specific user and maps it to a domain object.
 *
 * This function ensures that:
 * - The requested account exists.
 * - The account is owned by the given `userId`.
 *
 * It is intended for use in transactional workflows where subsequent operations
 * assume a valid `DomainAccount`.
 *
 * @param tx - Prisma transaction client for executing the query.
 * @param accountId - The ID of the account to retrieve.
 * @param userId - The ID of the user who must own the account.
 *
 * @returns The account mapped as a `DomainAccount`.
 *
 * @throws {AccountNotFoundError} If no account exists with the given `accountId`
 *                                 for the specified `userId`.
 */

export const getAccount = async (
  tx: Prisma.TransactionClient,
  accountId: AccountId,
  userId: UserId
): Promise<DomainAccount> => {
  const row = await accountRepository.getAccount(tx, accountId, userId);

  if (!row) {
    throw new AccountNotFoundError();
  }

  return accountMapper.toDomainAccount(row);
};
