import { prisma } from "../../../../../shared/prisma/client";
import { type DeleteAccountPayload } from "../../account.schema";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { transactionService } from "../../../transaction/transaction.service";
import { type AccountId, asAccountId } from "../../account.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

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

// TODO: HOW TO OPEN ACCOUNT BACK UP
export const deleteAccount = async (
  payload: DeleteAccountPayload
): Promise<void> => {
  const { accountId, userId } = toDeleteAccountCommand(payload);

  await prisma.$transaction(async (tx) => {
    const account = await accountService.getAccount(tx, accountId, userId);

    const transactions = await transactionRepository.getTransactionsByAccountId(
      tx,
      accountId
    );

    const accountHasNonZeroBalance = account.balance.gt(0);
    const accountHasTransactions = transactions.length > 0;

    if (!accountHasTransactions) {
      await accountRepository.deleteAccount(tx, accountId);
      return;
    }

    if (accountHasNonZeroBalance) {
      await transactionService.createBalanceAdjustmentTransaction(
        tx,
        userId,
        account.id,
        account.balance
      );
    }

    await accountRepository.closeAccount(tx, accountId);
  });
};
