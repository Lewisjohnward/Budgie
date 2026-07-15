import { type Prisma } from "@prisma/client";
import { transactionService } from "../../../transaction/transaction.service";
import { accountService } from "../../account.service";
import { type CreateAccountCommand } from "../use-cases/createAccount";
import { DomainAccount } from "../../account.types";

export const createAndInitialiseAccount = async (
  tx: Prisma.TransactionClient,
  payload: CreateAccountCommand
): Promise<DomainAccount> => {
  const { userId, balance } = payload;
  const hasOpeningBalance = !balance.isZero();

  const createdAccount = await accountService.createAccount(tx, payload);

  if (hasOpeningBalance) {
    await transactionService.createOpeningBalanceTransaction(
      tx,
      userId,
      createdAccount.id,
      balance
    );

    await accountService.refreshDeletableStatus(tx, [createdAccount.id]);
  }

  return createdAccount;
};
