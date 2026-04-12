import { type HashedPassword, type Salt } from "./user.domain";

/** Input required to create a new user record with a hashed password and salt. */
export type CreateUserInput = {
  email: string;
  password: HashedPassword;
  salt: Salt;
};
