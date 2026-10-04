import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../../helpers/auth";
import { createCategoryGroupWithCategories } from "../../../../../helpers/category";

export async function seedReorderCategoryGroups(tx: Prisma.TransactionClient) {
  const user = await registerUser(tx, testCredentials, {
    createDefaultUserCategories: false,
  });

  await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Everyday",
    categoryNames: ["Groceries", "Gym"],
  });

  await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Bills",
    categoryNames: ["Broadband", "Rent"],
  });

  return testCredentials;
}
