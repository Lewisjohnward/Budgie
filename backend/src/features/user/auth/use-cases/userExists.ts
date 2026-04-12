import { authRepository } from "../../../../shared/repository/authRepositoryImpl";
import { EmailAlreadyRegisteredError } from "../auth.errors";

/**
 * Ensures that no user account already exists for the given email address.
 *
 * @param email - Email address to validate.
 * @throws EmailAlreadyRegisteredError - If a user with the provided email already exists.
 */
export const userExistsByEmail = async (email: string): Promise<void> => {
  const userAlreadyExists =
    (await authRepository.findUserByEmail(email)) !== null;

  if (userAlreadyExists) {
    throw new EmailAlreadyRegisteredError();
  }
};
