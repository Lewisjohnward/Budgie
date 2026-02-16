import { prisma } from "../../../../../shared/prisma/client";
import { type DeleteAccountPayload } from "../../account.schema";
import { accountService } from "../../../account/account.service";
import { transactionService } from "../../../transaction/transaction.service";
import { type AccountId, asAccountId } from "../../account.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";
import { CannotDeleteUndeletableAccountError } from "../../account.errors";

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
 * This operation is performed within a single database transaction to ensure consistency:
 * 1. Checks whether the account is deletable.
 * 2. Deletes all transactions linked to the account.
 * 3. Deletes the account itself.
 *
 * @param payload - Data required to delete the account
 * @param payload.userId - ID of the user who owns the account
 * @param payload.accountId - ID of the account to delete
 *
 * @throws {CannotDeleteUndeletableAccountError} If the account cannot be deleted
 *
 * @returns A promise that resolves when the account and its transactions have been deleted.
 */
export const deleteAccount = async (
  payload: DeleteAccountPayload
): Promise<void> => {
  const { accountId, userId } = toDeleteAccountCommand(payload);

  await prisma.$transaction(async (tx) => {
    const account = await accountService.getAccount(tx, accountId, userId);
    const { deletable } = account;

    if (!deletable) {
      throw new CannotDeleteUndeletableAccountError();
    }

    await transactionService.deleteTransactionsByAccountId(
      tx,
      userId,
      accountId
    );

    await accountService.deleteAccount(tx, accountId);
  });
};
