import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { type AccountId, type db } from "./account.types";
import { type UserId } from "../../user/auth/auth.types";

export interface AccountRepository {
  getAccount(
    tx: Prisma.TransactionClient,
    accountId: AccountId,
    userId: UserId
  ): Promise<db.Account | null>;

  createAccount(
    tx: Prisma.TransactionClient,
    payload: any
  ): Promise<db.Account>;

  deleteAccount(
    tx: Prisma.TransactionClient,
    accountId: AccountId
  ): Promise<void>;

  /**
   * Checks whether the user already has an account with the given name.
   *
   * @param tx - Active Prisma transaction client.
   * @param userId - ID of the account owner.
   * @param name - Account name to check.
   * @returns True if an account with the same name exists for the user; otherwise false.
   */
  existsAccountWithName(
    tx: Prisma.TransactionClient,
    userId: UserId,
    name: string
  ): Promise<boolean>;

  closeAccount(
    tx: Prisma.TransactionClient,
    accountId: AccountId
  ): Promise<void>;

  updateAccountName(
    tx: Prisma.TransactionClient,
    accountId: AccountId,
    name: string
  ): Promise<void>;

  updateAccountBalances(
    tx: Prisma.TransactionClient,
    accountBalanceChanges: Record<AccountId, Decimal>
  ): Promise<void>;

  updateDeletableStatus(
    tx: Prisma.TransactionClient,
    accountId: AccountId,
    deletable: boolean
  ): Promise<void>;

  setAccountOpen(
    tx: Prisma.TransactionClient,
    accountId: AccountId,
    open: boolean
  ): Promise<void>;

  refreshDeletableStatusForAccounts(
    tx: Prisma.TransactionClient,
    accountIds: AccountId[]
  ): Promise<void>;
}
