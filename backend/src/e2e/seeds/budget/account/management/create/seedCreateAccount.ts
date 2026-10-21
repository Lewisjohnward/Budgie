import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../../helpers/auth";

export async function seedCreateAccount(tx: Prisma.TransactionClient) {
  const user = await registerUser(tx, testCredentials);

  return testCredentials;
}
