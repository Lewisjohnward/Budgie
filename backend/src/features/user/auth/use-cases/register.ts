import { prisma } from "../../../../shared/prisma/client";
import { type RegisterResult } from "../auth.contract";
import { type RegisterPayload } from "../auth.schema";
import { authService } from "../auth.service";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

/**
 * Registers a new user, creates initial domain data within a transaction, and returns auth tokens.
 *
 * @param payload - User registration data (email and password).
 * @returns Access and refresh tokens for the newly created user.
 */
export const register = async (
  payload: RegisterPayload
): Promise<RegisterResult> => {
  const user = await prisma.$transaction(async (tx) => {
    return await authService.provisionUser(tx, payload);
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

  return {
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};
