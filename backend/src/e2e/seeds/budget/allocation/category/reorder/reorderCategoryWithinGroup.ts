import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../../helpers/auth";
import { createCategoryGroupWithCategories } from "../../../../../helpers/category";

export async function seedReorderCategoryWithinGroup(
  tx: Prisma.TransactionClient
) {
  const user = await registerUser(tx, testCredentials, {
    createDefaultUserCategories: false,
  });

  await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Everyday",
    categoryNames: ["Groceries", "Gym", "Broadband"],
  });

  return testCredentials;
}
