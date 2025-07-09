import { prisma } from "../../../../../shared/prisma/client";
import { DeleteAccountPayload } from "../../account.schema";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { transactionService } from "../../../transaction/transaction.service";

// TODO: HOW TO OPEN ACCOUNT BACK UP
export const deleteAccount = async (payload: DeleteAccountPayload) => {
  const { accountId, userId } = payload;

  await prisma.$transaction(async (tx) => {
    const account = await accountService.getAccount(tx, accountId, userId);

    const transactions = await transactionRepository.getTransactionsByAccountId(
      tx,
      accountId,
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
        account.balance,
      );
    }

    await accountRepository.closeAccount(tx, accountId);
  });
};
