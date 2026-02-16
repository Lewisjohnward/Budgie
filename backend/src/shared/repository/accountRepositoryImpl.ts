import { Prisma } from "@prisma/client";
import { AccountRepository } from "../../features/budget/account/account.repository";
import { Decimal } from "@prisma/client/runtime/library";
import {
  CreateAccountPayloadWithPosition,
  type AccountId,
  type db,
} from "../../features/budget/account/account.types";
import { type UserId } from "../../features/user/auth/auth.types";

export const accountRepository: AccountRepository = {
  createAccount: async function (
    tx: Prisma.TransactionClient,
    payload: CreateAccountPayloadWithPosition
  ): Promise<db.Account> {
    return await tx.account.create({
      data: payload,
    });
  },

  getAccount: async function (
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

  // TODO:(lewis 2026-02-05 20:08) this can be improved, surely can do update many // //
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

  deleteAccount: async function (
    tx: Prisma.TransactionClient,
    accountId: AccountId
  ): Promise<void> {
    await tx.account.delete({
      where: {
        id: accountId,
      },
    });
  },

  closeAccount: async function (
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

  updateAccountName: async function (
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

  existsAccountWithName: async function (
    tx: Prisma.TransactionClient,
    userId: UserId,
    name: string
  ): Promise<boolean> {
    const row = await tx.account.findFirst({
      where: {
        userId,
        name: {
          equals: name,
        },
      },
      select: { id: true },
    });
    return !!row;
  },

  updateDeletableStatus: async function (
    tx: Prisma.TransactionClient,
    accountId: AccountId,
    deletable: boolean
  ): Promise<void> {
    await tx.account.update({
      where: {
        id: accountId,
      },
      data: {
        deletable,
      },
    });
  },

  setAccountOpen: async function (
    tx: Prisma.TransactionClient,
    accountId: AccountId,
    open: boolean
  ): Promise<void> {
    await tx.account.update({
      where: { id: accountId },
      data: { open },
    });
  },

  /**
   * Updates the `deletable` status for the given accounts.
   *
   * An account is deletable if it has no user-created transactions.
   * This function enforces that rule using bulk SQL updates.
   *
   * @param tx - Prisma transaction client
   * @param accountIds - Account IDs to refresh
   */
  refreshDeletableStatusForAccounts: async function (
    tx: Prisma.TransactionClient,
    accountIds: AccountId[]
  ): Promise<void> {
    await tx.$executeRaw`
      UPDATE "Account" a
      SET "deletable" = false
      WHERE a.id = ANY(${accountIds})
        AND EXISTS (
          SELECT 1
          FROM "Transaction" t
          WHERE t."accountId" = a.id
          AND t."origin" = 'USER'
        )
    `;

    await tx.$executeRaw`
  UPDATE "Account" a
  SET "deletable" = true
  WHERE a.id = ANY(${accountIds})
    AND NOT EXISTS (
      SELECT 1
      FROM "Transaction" t
      WHERE t."accountId" = a.id
        AND t."origin" = 'USER'
    )
`;
  },
};
