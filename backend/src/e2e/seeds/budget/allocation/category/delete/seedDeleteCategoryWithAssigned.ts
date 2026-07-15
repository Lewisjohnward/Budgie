import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../../helpers/auth";
import {
  createCategoryGroupWithCategories,
  assignToMonth,
} from "../../../../../helpers/category";

export async function seedDeleteCategoryWithAssigned(
  tx: Prisma.TransactionClient
) {
  const user = await registerUser(tx, testCredentials);

  const { categories } = await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Important",
    categoryNames: ["Groceries"],
  });

  const month = categories.Groceries.months[0];

  await assignToMonth(tx, user.id, { monthId: month.id, amount: 10 });

  return testCredentials;
}
