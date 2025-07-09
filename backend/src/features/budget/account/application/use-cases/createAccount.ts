import { ZERO } from "../../../../../shared/constants/zero";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { transactionService } from "../../../transaction/transaction.service";
import { AddAccountPayload } from "../../account.schema";
import { prisma } from "../../../../../shared/prisma/client";

export const createAccount = async (
  payload: AddAccountPayload,
): Promise<void> => {
  const { userId, balance: inflow } = payload;
  await prisma.$transaction(async (tx) => {
    const createdAccount = await accountRepository.createAccount(tx, {
      ...payload,
      balance: ZERO,
    });
    const hasOpeningBalance = payload.balance.gt(0);

    if (hasOpeningBalance) {
      await transactionService.createOpeningBalanceTransaction(
        tx,
        userId,
        createdAccount.id,
        inflow,
      );
    }
  });
};
