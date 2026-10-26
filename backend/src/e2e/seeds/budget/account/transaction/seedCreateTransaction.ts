import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../helpers/auth";
import { createBankAccount } from "../../../../helpers/account";
import { createCategoryGroupWithCategories } from "../../../../helpers/category";

export async function seedCreateTransaction(tx: Prisma.TransactionClient) {
  const user = await registerUser(tx, testCredentials);

  await createBankAccount(tx, user.id, {
    name: "test account",
    balance: 0,
  });

  await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "test",
    categoryNames: ["e2e-test"],
  });

  return testCredentials;
}
