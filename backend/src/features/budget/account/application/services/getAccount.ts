import { Prisma } from "@prisma/client";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { AccountNotFoundError } from "../../account.errors";

export const getAccount = async (
  tx: Prisma.TransactionClient,
  accountId: string,
  userId: string,
) => {
  const account = await accountRepository.getAccount(tx, accountId, userId);

  if (!account) {
    throw new AccountNotFoundError();
  }

  return account;
};
