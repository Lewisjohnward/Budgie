import { userExists } from "./use-cases/userExists";
import { getUser } from "./use-cases/getUser";
import { createUser } from "./use-cases/createUser";
import { updateRefreshToken } from "./use-cases/updateRefreshToken";

export const authService = {
  userExists: userExists,
  getUser: getUser,
  createUser: createUser,
  updateRefreshToken: updateRefreshToken,
};