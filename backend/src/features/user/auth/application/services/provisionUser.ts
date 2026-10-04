import { type Prisma } from "@prisma/client";
import { categoryService } from "../../../../budget/core/category/core/category.service";
import { memoService } from "../../../../budget/core/memo/memo.service";
import { payeeService } from "../../../../budget/core/payee/payee.service";
import { type RegisterPayload } from "../../auth.schema";
import { authService } from "../../auth.service";
import { generatePassword, generateSalt } from "../../utils/password";
import { type DomainUser } from "../../auth.types";

type ProvisionUserOptions = {
  createDefaultUserCategories?: boolean;
};

/**
 * Provisions a new user and their system resources.
 *
 * By default, also creates the user's default category groups.
 * Set `createDefaults` to false to omit the default user category groups.
 */
export async function provisionUser(
  tx: Prisma.TransactionClient,
  payload: RegisterPayload,
  { createDefaultUserCategories = true }: ProvisionUserOptions = {}
): Promise<DomainUser> {
  const { password, email } = payload;

  await authService.userExistsByEmail(email);

  const salt = await generateSalt();
  const passwordHash = await generatePassword(password, salt);

  const user = await authService.createUser(tx, {
    email,
    password: passwordHash,
    salt,
  });

  await categoryService.categories.initialiseSystemCategories(tx, user.id);

  if (createDefaultUserCategories) {
    await categoryService.categories.initialiseUserCategories(tx, user.id);
  }

  await memoService.initialiseMemos(tx, user.id);
  await payeeService.initialiseSystemPayees(tx, user.id);

  return user;
}
