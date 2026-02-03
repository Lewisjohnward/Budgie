import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { type AddAccountPayload } from "./account.schema";
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
    payload: AddAccountPayload
  ): Promise<db.Account>;

  deleteAccount(
    tx: Prisma.TransactionClient,
    accountId: AccountId
  ): Promise<void>;

  closeAccount(
    tx: Prisma.TransactionClient,
    accountId: AccountId
  ): Promise<void>;

  updateAccount(
    tx: Prisma.TransactionClient,
    accountId: AccountId,
    name: string
  ): Promise<void>;

  updateAccountBalances(
    tx: Prisma.TransactionClient,
    accountBalanceChanges: Record<AccountId, Decimal>
  ): Promise<void>;
}
