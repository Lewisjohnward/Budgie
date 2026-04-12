import bcrypt from "bcrypt";
import { type HashedPassword, type Salt } from "../auth.types";

/**
 * Generates a cryptographic salt for password hashing.
 *
 * @returns A generated salt value.
 */
export const generateSalt = async (): Promise<Salt> => {
  return (await bcrypt.genSalt()) as Salt;
};

/**
 * Hashes a plain text password using the provided salt.
 *
 * @param password - The plain text password to hash.
 * @param salt - The cryptographic salt used for hashing.
 * @returns The resulting hashed password.
 */
export const generatePassword = async (
  password: string,
  salt: string
): Promise<HashedPassword> => {
  return (await bcrypt.hash(password, salt)) as HashedPassword;
};

/**
 * Validates a plain text password against a stored hashed password.
 *
 * @param enteredPassword - The password entered by the user.
 * @param savedPassword - The stored hashed password.
 * @param salt - The salt used when hashing the original password.
 * @returns `true` if the password matches, otherwise `false`.
 */
export const validatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
): Promise<boolean> => {
  return (await generatePassword(enteredPassword, salt)) === savedPassword;
};
