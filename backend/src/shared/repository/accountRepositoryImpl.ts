import { Prisma } from "@prisma/client";
import { AccountRepository } from "../../features/budget/core/account/account.repository";
import { Decimal } from "@prisma/client/runtime/library";
import {
  type AccountType,
  CreateAccountPayloadWithPosition,
  type AccountId,
  type db,
} from "../../features/budget/core/account/account.types";
import { type UserId } from "../../features/user/auth/auth.types";
import { prisma } from "../prisma/client";

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

  getAccountsByIds: async (tx, userId, accountIds): Promise<db.Account[]> => {
    return tx.account.findMany({
      where: {
        id: {
          in: accountIds,
        },
        userId,
      },
    });
  },

  getAccounts: async function (userId: UserId): Promise<db.Account[]> {
    return await prisma.account.findMany({
      where: {
        userId,
      },
      orderBy: {
        position: "asc",
      },
    });
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

  /**
   * Repositions accounts after an account has been deleted.
   *
   * Retrieves all accounts belonging to the specified user and account type
   * whose positions are higher than the deleted account's position, then
   * decrements each position by one to maintain a contiguous ordering.
   *
   * Accounts belonging to other users or account types are unaffected.
   *
   * Accounts are updated sequentially in ascending position order to avoid
   * potential unique constraint violations when positions are indexed by
   * user and account type.
   *
   * Returns the updated account records for all accounts whose positions
   * have changed.
   *
   * @param tx - Prisma transaction client used for database operations.
   * @param userId - ID of the user whose accounts need repositioning.
   * @param type - Account type used to scope the repositioning operation.
   * @param deletedPosition - Position of the deleted account.
   * @returns A promise that resolves to the updated account records.
   */
  shiftAccountsAfterDeletion: async (
    tx: Prisma.TransactionClient,
    userId: UserId,
    type: AccountType,
    deletedPosition: number
  ): Promise<db.Account[]> => {
    const accounts = await tx.account.findMany({
      where: {
        userId,
        type,
        position: {
          gt: deletedPosition,
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    const updatedAccounts = [];

    for (const account of accounts) {
      const updatedAccount = await tx.account.update({
        where: {
          id: account.id,
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });

      updatedAccounts.push(updatedAccount);
    }

    return updatedAccounts;
  },
};
