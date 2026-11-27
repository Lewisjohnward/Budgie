import { prisma } from "../../../../../../shared/prisma/client";
import { type DeleteAccountPayload } from "../../account.schema";
import { accountService } from "../../../account/account.service";
import { transactionService } from "../../../transaction/transaction.service";
import { type AccountId, asAccountId } from "../../account.types";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { CannotDeleteUndeletableAccountError } from "../../account.errors";
import { type DeleteAccountResult } from "../../account.contract";

export type DeleteAccountCommand = Omit<
  DeleteAccountPayload,
  "accountId" | "userId"
> & {
  accountId: AccountId;
  userId: UserId;
};

export const toDeleteAccountCommand = (
  p: DeleteAccountPayload
): DeleteAccountCommand => ({
  ...p,
  userId: asUserId(p.userId),
  accountId: asAccountId(p.accountId),
});

/**
 * Deletes an account and all its associated transactions.
 *
 * Performs the deletion within a single database transaction to ensure
 * consistency. The operation:
 *
 * 1. Retrieves the account and checks whether it can be deleted.
 * 2. Deletes all transactions associated with the account and updates the
 *    affected budget months.
 * 3. Deletes the account itself.
 *
 * All database changes are committed or rolled back together.
 *
 * @param payload - Data required to delete the account
 * @param payload.userId - ID of the user who owns the account
 * @param payload.accountId - ID of the account to delete
 *
 * @throws {CannotDeleteUndeletableAccountError} If the account cannot be deleted
 *
 * @returns A promise that resolves to the deleted account, deleted
 * transactions, and updated budget months.
 */
export const deleteAccount = async (
  payload: DeleteAccountPayload
): Promise<DeleteAccountResult> => {
  const { accountId, userId } = toDeleteAccountCommand(payload);

  return await prisma.$transaction(async (tx) => {
    const account = await accountService.getAccount(tx, accountId, userId);
    const { deletable } = account;

    if (!deletable) {
      throw new CannotDeleteUndeletableAccountError();
    }

    const result = await transactionService.deleteTransactionsByAccountId(
      tx,
      userId,
      accountId
    );

    await accountService.deleteAccount(tx, accountId);

    await accountService.shiftAccountsAfterDeletion(
      tx,
      userId,
      account.type,
      account.position
    );

    return {
      deletedAccount: account,
      deletedTransactions: result.deletedTransactions,
      updatedMonths: result.updatedMonths,
    };
  });
};
