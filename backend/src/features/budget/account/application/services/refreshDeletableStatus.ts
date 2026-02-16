import { Prisma } from "@prisma/client";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { AccountId } from "../../account.types";

/**
 * Refreshes the `deletable` status for the given accounts.
 *
 * Delegates to the repository to enforce the rule:
 * an account is deletable if it has no user transactions.
 *
 * @param tx - Prisma transaction client
 * @param accountIds - Account IDs to refresh
 */
export const refreshDeletableStatus = async (
  tx: Prisma.TransactionClient,
  accountIds: AccountId[]
) => {
  await accountRepository.refreshDeletableStatusForAccounts(tx, accountIds);
};
