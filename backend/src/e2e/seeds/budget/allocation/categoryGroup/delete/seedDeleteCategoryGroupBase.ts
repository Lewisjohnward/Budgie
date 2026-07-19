import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../../helpers/auth";
import { createCategoryGroupWithCategories } from "../../../../../helpers/category";

export async function seedDeleteCategoryGroupBase(
  tx: Prisma.TransactionClient
) {
  const user = await registerUser(tx, testCredentials);

  await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Important",
    categoryNames: [],
  });

  return testCredentials;
}
