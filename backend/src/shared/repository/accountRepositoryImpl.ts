import { Prisma } from "@prisma/client";
import { AccountRepository } from "../../features/budget/account/account.repository";
import { Decimal } from "@prisma/client/runtime/library";
import { type AddAccountPayload } from "../../features/budget/account/account.schema";
import {
  type AccountId,
  type db,
} from "../../features/budget/account/account.types";
import { type UserId } from "../../features/user/auth/auth.types";

export const accountRepository: AccountRepository = {
  createAccount: async function(
    tx: Prisma.TransactionClient,
    payload: AddAccountPayload
  ): Promise<db.Account> {
    return await tx.account.create({
      data: payload,
    });
  },

  getAccount: async function(
    tx: Prisma.TransactionClient,
    accountId: AccountId,
    userId: UserId
  ): Promise<db.Account | null> {
    const row = await tx.account.findUnique({
      where: {
        id: accountId,
        userId,
      },
    });
    if (!row) {
      return null;
    }
    return row;
  },

  // TODO:(lewis 2026-02-05 20:08) this can be improved, surely can do update many
  updateAccountBalances: async function (
    tx: Prisma.TransactionClient,
    accountBalanceChanges: {
      [accountId: string]: Decimal;
    }
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
    accountId: AccountId
  ): Promise<void> {
    await tx.account.delete({
      where: {
        id: accountId,
      },
    });
  },

  closeAccount: async function(
    tx: Prisma.TransactionClient,
    accountId: AccountId
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
    accountId: AccountId,
    name: string
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
