import { authRepository } from "../../../../shared/repository/authRepositoryImpl";
import { type UserId } from "../auth.types";

/**
 * Updates the refresh token for a specific user.
 *
 * This is typically used during authentication flows (e.g. login or token refresh)
 * to persist the latest refresh token associated with the user.
 *
 * @param userId - The unique identifier of the user.
 * @param refreshToken - The new refresh token to store.
 * @returns A promise that resolves when the update is complete.
 */
export const updateRefreshToken = async (
  userId: UserId,
  refreshToken: string
): Promise<void> => {
  await authRepository.updateRefreshToken(userId, refreshToken);
};
