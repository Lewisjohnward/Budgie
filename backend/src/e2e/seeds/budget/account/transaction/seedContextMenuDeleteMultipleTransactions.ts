import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { asAccountId } from "../../../../../features/budget/core/account/account.types";
import { transactionService } from "../../../../../features/budget/core/transaction/transaction.service";
import { asUserId } from "../../../../../features/user/auth/auth.types";
import { createBankAccount } from "../../../../helpers/account";
import { registerUser, testCredentials } from "../../../../helpers/auth";

export async function seedContextMenuDeleteMultipleTransactions(
  tx: Prisma.TransactionClient
) {
  const user = await registerUser(tx, testCredentials);

  const account = await createBankAccount(tx, user.id, {
    name: "test account",
    balance: 0,
  });

  await transactionService.createNormalTransaction(tx, {
    type: "normal",
    userId: asUserId(user.id),
    accountId: asAccountId(account.id),
    date: new Date(),
    memo: "test transaction outflow",
    outflow: new Decimal(10),
    inflow: new Decimal(0),
    origin: "USER",
  });

  await transactionService.createNormalTransaction(tx, {
    type: "normal",
    userId: asUserId(user.id),
    accountId: asAccountId(account.id),
    date: new Date(),
    memo: "test transaction inflow",
    outflow: new Decimal(0),
    inflow: new Decimal(10),
    origin: "USER",
  });

  return testCredentials;
}
