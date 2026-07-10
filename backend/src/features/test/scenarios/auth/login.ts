import { type Prisma } from "@prisma/client";
import { type RegisterPayload } from "../../../user/auth/auth.schema";
import { authService } from "../../../user/auth/auth.service";

export async function seedLogin(tx: Prisma.TransactionClient) {
  const credentials: RegisterPayload = {
    email: "e2e@test.com",
    password: "EBcav4KN$tmG",
  };

  await authService.provisionUser(tx, credentials);

  return credentials;
}
