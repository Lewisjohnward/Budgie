import { getUser } from "./use-cases/getUser";
import { createUser } from "./use-cases/createUser";
import { updateRefreshToken } from "./use-cases/updateRefreshToken";
import { userExistsByEmail } from "./use-cases/userExists";
import { provisionUser } from "./application/services/provisionUser";

export const authService = {
  getUser: getUser,
  createUser: createUser,
  updateRefreshToken: updateRefreshToken,
  provisionUser,

  userExistsByEmail,
};
