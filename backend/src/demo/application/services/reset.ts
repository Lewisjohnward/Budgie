import { Prisma } from "@prisma/client";

export const reset = async (tx: Prisma.TransactionClient) => {
  await tx.$executeRawUnsafe(`
  TRUNCATE TABLE
    "Transaction",
    "Month",
    "Category",
    "CategoryGroup",
    "Account",
    "Payee",
    "MonthMemo",
    "User"
  RESTART IDENTITY CASCADE;
`);
};
