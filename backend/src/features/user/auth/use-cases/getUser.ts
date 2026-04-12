import { authRepository } from "../../../../shared/repository/authRepositoryImpl";
import { InvalidCredentialsError } from "../auth.errors";
import { authMapper } from "../auth.mapper";
import { type DomainUser } from "../auth.types";

/**
 * Retrieves a user by email and maps them to the domain model.
 *
 * @param email - The email address of the user to retrieve.
 * @returns The corresponding domain user.
 * @throws InvalidCredentialsError if no user is found with the given email.
 */
export const getUser = async (email: string): Promise<DomainUser> => {
  const userRow = await authRepository.findUserByEmail(email);

  if (!userRow) {
    throw new InvalidCredentialsError();
  }

  return authMapper.toDomainUser(userRow);
};
