import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../../helpers/auth";
import { createCategoryGroupWithCategories } from "../../../../../helpers/category";

export async function seedReorderCategory(tx: Prisma.TransactionClient) {
  const user = await registerUser(tx, testCredentials, {
    createDefaultUserCategories: false,
  });

  await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Everyday",
    categoryNames: ["Groceries", "Gym", "Phone"],
  });

  await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Bills",
    categoryNames: ["Broadband", "Rent"],
  });

  await createCategoryGroupWithCategories(tx, user.id, {
    categoryGroupName: "Empty",
    categoryNames: [],
  });

  return testCredentials;
}
