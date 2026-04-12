import { type Prisma } from "@prisma/client";
import { type CreateUserInput, type db, type UserId } from "./auth.types";

export interface AuthRepository {
  /**
   * Retrieves a user by their email address.
   *
   * @param email - The email address of the user to look up.
   * @returns The matching user if found, otherwise `null`.
   */
  findUserByEmail(email: string): Promise<db.User | null>;

  findUserByRefreshToken(refreshToken: string): Promise<db.User | null>;

  /**
   * Creates a new user record in the database within a transaction.
   *
   * @param tx - Prisma transaction client.
   * @param user - The user data required to create a new user.
   * @returns The newly created user record.
   */
  createUser(
    tx: Prisma.TransactionClient,
    user: CreateUserInput
  ): Promise<db.User>;

  /**
   * Updates or clears the refresh token for a user.
   *
   * @param userId - The unique identifier of the user.
   * @param refreshToken - The new refresh token, or null to clear it.
   */
  updateRefreshToken(
    userId: UserId,
    refreshToken: string | null
  ): Promise<void>;
}
