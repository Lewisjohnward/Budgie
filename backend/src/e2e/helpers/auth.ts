import { type Prisma } from "@prisma/client";
import { type RegisterPayload } from "../../features/user/auth/auth.schema";
import { authService } from "../../features/user/auth/auth.service";
import { type DomainUser } from "../../features/user/auth/auth.types";

export const testCredentials: RegisterPayload = {
  email: "e2e@test.com",
  password: "EBcav4KN$tmG",
};

export const registerUser = async (
  tx: Prisma.TransactionClient,
  credentials: RegisterPayload = testCredentials
): Promise<DomainUser> => {
  return await authService.provisionUser(tx, credentials);
};
