import { type Prisma } from "@prisma/client";
import { authRepository } from "../../../../shared/repository/authRepositoryImpl";
import { authMapper } from "../auth.mapper";
import { type CreateUserInput, type DomainUser } from "../auth.types";

/**
 * Creates a new user within a database transaction and returns the domain representation.
 *
 * This function delegates persistence to the auth repository and maps the resulting
 * database record into a domain-level user object.
 *
 * @param tx - Prisma transaction client ensuring atomic database operations.
 * @param user - The user data required to create a new user (email, password, salt).
 * @returns The created user mapped into the domain model.
 */
export const createUser = async (
  tx: Prisma.TransactionClient,
  user: CreateUserInput
): Promise<DomainUser> => {
  const row = await authRepository.createUser(tx, user);

  return authMapper.toDomainUser(row);
};
