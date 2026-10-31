import { accountRepository } from "../../../../../../shared/repository/accountRepositoryImpl";
import { AccountId, type DomainAccount } from "../../account.types";
import { accountMapper } from "../../account.mapper";
import { type UserId } from "../../../../../user/auth/auth.types";
import { Prisma } from "@prisma/client";

/**
 * Retrieves multiple accounts belonging to a specific user by their IDs
 * within the provided Prisma transaction and maps the results to domain
 * account entities.
 *
 * @param tx - The Prisma transaction client used to execute the query.
 * @param userId - The ID of the user who owns the accounts.
 * @param accountIds - The IDs of the accounts to retrieve.
 * @returns A promise resolving to an array of domain account entities.
 */
export const getAccountsByIds = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  accountIds: AccountId[]
): Promise<DomainAccount[]> => {
  const rawAccounts = await accountRepository.getAccountsByIds(
    tx,
    userId,
    accountIds
  );

  return rawAccounts.map(accountMapper.toDomainAccount);
};
