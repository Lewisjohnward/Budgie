import { type Prisma } from "@prisma/client";
import { registerUser, testCredentials } from "../../../../../helpers/auth";

export async function seedUpdateMemoBase(tx: Prisma.TransactionClient) {
  await registerUser(tx, testCredentials);

  return testCredentials;
}
