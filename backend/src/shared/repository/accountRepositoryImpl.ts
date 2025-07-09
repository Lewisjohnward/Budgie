import { Prisma, Account } from "@prisma/client";
import { AccountRepository } from "../../features/budget/account/account.repository";
import { Decimal } from "@prisma/client/runtime/library";
import { AddAccountPayload } from "../../features/budget/account/account.schema";

export const accountRepository: AccountRepository = {
  createAccount: async function(
    tx: Prisma.TransactionClient,
    payload: AddAccountPayload,
  ): Promise<Account> {
    return await tx.account.create({
      data: payload,
    });
  },

  getAccount: async function(
    tx: Prisma.TransactionClient,
    accountId: string,
    userId: string,
  ): Promise<Account | null> {
    return tx.account.findUnique({
      where: {
        id: accountId,
        userId,
      },
    });
  },

  updateAccountBalances: async function(
    tx: Prisma.TransactionClient,
    accountBalanceChanges: { [accountId: string]: Decimal },
  ): Promise<void> {
    for (const accountId in accountBalanceChanges) {
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: accountBalanceChanges[accountId] },
        },
      });
    }
  },

  deleteAccount: async function(
    tx: Prisma.TransactionClient,
    accountId: string,
  ): Promise<void> {
    await tx.account.delete({
      where: {
        id: accountId,
      },
    });
  },

  closeAccount: async function(
    tx: Prisma.TransactionClient,
    accountId: string,
  ): Promise<void> {
    await tx.account.update({
      where: {
        id: accountId,
      },
      data: {
        open: false,
      },
    });
  },

  updateAccount: async function(
    tx: Prisma.TransactionClient,
    accountId: string,
    name: string,
  ): Promise<void> {
    await tx.account.update({
      where: {
        id: accountId,
      },
      data: {
        name: name,
      },
    });
  },
};
