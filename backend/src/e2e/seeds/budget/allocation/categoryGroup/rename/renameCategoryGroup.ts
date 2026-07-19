import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../../helpers/auth";
import { createCategoryGroupWithCategories } from "../../../../../helpers/category";
import { createBankAccount } from "../../../../../helpers/account";
import { createNormalTransaction } from "../../../../../helpers/transaction";

export async function seedRenameCategoryGroup(tx: Prisma.TransactionClient) {
  const user = await registerUser(tx, testCredentials);

  const { categories } = await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Important",
    categoryNames: ["Groceries"],
  });

  const account = await createBankAccount(tx, user.id, {
    name: "test account",
    balance: 10,
  });

  await createNormalTransaction(tx, user.id, {
    accountId: account.id,
    categoryId: categories.Groceries.category.id,
    date: new Date(),
    outflow: 10,
  });

  return testCredentials;
}
