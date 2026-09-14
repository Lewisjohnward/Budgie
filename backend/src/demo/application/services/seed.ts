import { type Prisma } from "@prisma/client";
import { createCategoryGroupWithCategories } from "../../../e2e/helpers/category";
import { createBankAccount } from "../../../e2e/helpers/account";
import { createNormalTransaction } from "../../../e2e/helpers/transaction";
import { demoCredentials, registerUser } from "../../../e2e/helpers/auth";

export const seedDemo = async (tx: Prisma.TransactionClient) => {
  const user = await registerUser(tx, demoCredentials);

  const { categories } = await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Important",
    categoryNames: ["Groceries", "Christmas"],
  });

  const account = await createBankAccount(tx, user.id, {
    name: "Santander",
    balance: 10,
  });

  await createNormalTransaction(tx, user.id, {
    accountId: account.id,
    categoryId: categories.Groceries.category.id,
    date: new Date(),
    outflow: 10,
  });

  return demoCredentials;
};
