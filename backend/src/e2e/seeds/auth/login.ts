import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../helpers/auth";
import { type RegisterPayload } from "../../../features/user/auth/auth.schema";

export async function seedLogin(
  tx: Prisma.TransactionClient
): Promise<RegisterPayload> {
  await registerUser(tx, testCredentials);

  return testCredentials;
}
