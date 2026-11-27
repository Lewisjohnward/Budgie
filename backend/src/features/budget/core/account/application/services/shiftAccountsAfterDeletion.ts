import { type Prisma } from "@prisma/client";
import { accountRepository } from "../../../../../../shared/repository/accountRepositoryImpl";
import { type DomainAccount, type AccountType } from "../../account.types";
import { type UserId } from "../../../../../user/auth/auth.types";
import { toDomainAccount } from "../../mappers/toDomainAccount";

/**
 * Shifts accounts after an account has been deleted.
 *
 * Delegates to the account repository to decrement the positions of all
 * accounts belonging to the specified user and account type whose positions
 * are higher than the deleted account's position.
 *
 * Converts the updated account records into domain accounts before returning
 * them, allowing callers to access the updated account positions.
 *
 * This maintains contiguous account ordering while preserving independent
 * ordering between different account types (e.g. BANK and CREDIT_CARD).
 *
 * @param tx - Prisma transaction client used for database operations.
 * @param userId - ID of the user whose accounts need repositioning.
 * @param type - Account type used to scope the repositioning operation.
 * @param deletedPosition - Original position of the deleted account.
 * @returns A promise that resolves to the updated domain accounts.
 */
export const shiftAccountsAfterDeletion = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  type: AccountType,
  deletedPosition: number
): Promise<DomainAccount[]> => {
  const updatedAccounts = await accountRepository.shiftAccountsAfterDeletion(
    tx,
    userId,
    type,
    deletedPosition
  );

  return updatedAccounts.map(toDomainAccount);
};
