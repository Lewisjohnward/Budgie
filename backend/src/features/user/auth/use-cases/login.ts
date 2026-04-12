import { prisma } from "../../../../shared/prisma/client";
import { categoryService } from "../../../budget/category/core/category.service";
import { InvalidCredentialsError } from "../auth.errors";
import { type LoginPayload } from "../auth.schema";
import { authService } from "../auth.service";
import { type AuthTokens } from "../auth.types";
import { validatePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

/**
 * Authenticates a user using email and password, ensures account state is up to date,
 * and returns new authentication tokens.
 *
 * @param payload - The login credentials containing email and password.
 * @returns An object containing an access token and refresh token.
 * @throws InvalidCredentialsError if the password is incorrect or authentication fails.
 */
export const login = async (payload: LoginPayload): Promise<AuthTokens> => {
  const { email, password } = payload;

  const user = await authService.getUser(email);

  const validPassword = await validatePassword(
    password,
    user.password,
    user.salt
  );

  if (!validPassword) {
    throw new InvalidCredentialsError();
  }

  await categoryService.months.ensureMonthsContinuity(prisma, user.id);

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
