import { type Prisma } from "@prisma/client";
import { type RegisterPayload } from "../../user/auth/auth.schema";
import { authService } from "../../user/auth/auth.service";
import { categoryGroupService } from "../../budget/core/categorygroup/categoryGroup.service";
import { categoryService } from "../../budget/core/category/core/category.service";
import { type CreateCategoryCommand } from "../../budget/core/category/core/application/use-cases/createCategory";

export async function seedDeleteCategoryBase(tx: Prisma.TransactionClient) {
  const userCredentials: RegisterPayload = {
    email: "e2e@test.com",
    password: "EBcav4KN$tmG",
  };

  const user = await authService.provisionUser(tx, userCredentials);

  const categoryGroup = await categoryGroupService.createCategoryGroup(tx, {
    userId: user.id,
    name: "Important",
  });

  const createCategoryCommand: CreateCategoryCommand = {
    categoryGroupId: categoryGroup.id,
    name: "Groceries",
    userId: user.id,
  };

  await categoryService.categories.createCategoryWithMonths(
    tx,
    createCategoryCommand
  );

  return {
    email: userCredentials.email,
    password: userCredentials.password,
  };
}
