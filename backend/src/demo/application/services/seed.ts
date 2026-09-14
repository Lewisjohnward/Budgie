import { type Prisma } from "@prisma/client";
import { createCategoryGroupWithCategories } from "../../../e2e/helpers/category";
import { createBankAccount } from "../../../e2e/helpers/account";
import { createNormalTransaction } from "../../../e2e/helpers/transaction";
import { demoCredentials } from "../../../e2e/helpers/auth";
import { authService } from "../../../features/user/auth/auth.service";
import { categoryService } from "../../../features/budget/core/category/core/category.service";
import { memoService } from "../../../features/budget/core/memo/memo.service";
import { payeeService } from "../../../features/budget/core/payee/payee.service";
import { HashedPassword, Salt } from "../../../features/user/auth/auth.types";

export const seedDemo = async (tx: Prisma.TransactionClient) => {
  // manually hashing password as vps is timing out
  const user = await authService.createUser(tx, {
    email: process.env.DEMO_EMAIL!,
    password: process.env.DEMO_PASSWORD_HASH! as HashedPassword,
    salt: process.env.DEMO_PASSWORD_SALT! as Salt,
  });

  await categoryService.categories.initialiseCategories(tx, user.id);
  await memoService.initialiseMemos(tx, user.id);
  await payeeService.initialiseSystemPayees(tx, user.id);

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
