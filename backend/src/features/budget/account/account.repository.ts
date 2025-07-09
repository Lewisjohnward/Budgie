import { Account, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { AddAccountPayload } from "./account.schema";

export interface AccountRepository {
  getAccount(
    tx: Prisma.TransactionClient,
    accountId: string,
    userId: string,
  ): Promise<Account | null>;

  createAccount(
    tx: Prisma.TransactionClient,
    payload: AddAccountPayload,
  ): Promise<Account>;

  deleteAccount(tx: Prisma.TransactionClient, accountId: string): Promise<void>;

  closeAccount(tx: Prisma.TransactionClient, accountId: string): Promise<void>;

  updateAccount(
    tx: Prisma.TransactionClient,
    accountId: string,
    name: string,
  ): Promise<void>;

  updateAccountBalances(
    tx: Prisma.TransactionClient,
    accountBalanceChanges: { [accountId: string]: Decimal },
  ): Promise<void>;
}
