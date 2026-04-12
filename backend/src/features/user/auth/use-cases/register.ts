import { prisma } from "../../../../shared/prisma/client";
import { categoryService } from "../../../budget/category/core/category.service";
import { memoService } from "../../../budget/memo/memo.service";
import { payeeService } from "../../../budget/payee/payee.service";
import { type RegisterPayload } from "../auth.schema";
import { authService } from "../auth.service";
import { type AuthTokens } from "../auth.types";
import { generatePassword, generateSalt } from "../utils/password";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

/**
 * Registers a new user, creates initial domain data within a transaction, and returns auth tokens.
 *
 * @param payload - User registration data (email and password).
 * @returns Access and refresh tokens for the newly created user.
 */
export const register = async (
  payload: RegisterPayload
): Promise<AuthTokens> => {
  const { password, email } = payload;

  await authService.userExistsByEmail(email);

  const salt = await generateSalt();

  const passwordHash = await generatePassword(password, salt);

  const user = await prisma.$transaction(async (tx) => {
    const user = await authService.createUser(tx, {
      email,
      password: passwordHash,
      salt,
    });

    await categoryService.categories.initialiseCategories(tx, user.id);
    await memoService.initialiseMemos(tx, user.id);
    await payeeService.initialiseSystemPayees(tx, user.id);

    return user;
  });

  const accessToken = generateAccessToken({
    _id: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    _id: user.id,
    email: user.email,
  });

  await authService.updateRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
};
