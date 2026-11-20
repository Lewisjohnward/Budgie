import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../helpers/auth";
import { createBankAccount } from "../../../../helpers/account";
import { createCategoryGroupWithCategories } from "../../../../helpers/category";
import { Decimal } from "@prisma/client/runtime/library";
import { asAccountId } from "../../../../../features/budget/core/account/account.types";
import { transactionService } from "../../../../../features/budget/core/transaction/transaction.service";
import { asUserId } from "../../../../../features/user/auth/auth.types";

export async function seedEditTransaction(tx: Prisma.TransactionClient) {
  const user = await registerUser(tx, testCredentials);

  const account = await createBankAccount(tx, user.id, {
    name: "test account",
    balance: 0,
  });

  await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "test",
    categoryNames: ["e2e-test"],
  });

  await transactionService.createNormalTransaction(tx, {
    type: "normal",
    userId: asUserId(user.id),
    accountId: asAccountId(account.id),
    date: new Date(),
    memo: "test transaction",
    outflow: new Decimal(10),
    inflow: new Decimal(0),
    origin: "USER",
  });

  return testCredentials;
}
