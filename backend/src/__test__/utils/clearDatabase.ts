// testUtils/clearDatabase.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function clearDatabase() {
  await prisma.$transaction([
    prisma.month.deleteMany({}),
    prisma.transaction.deleteMany({}),
    prisma.account.deleteMany({}),
    prisma.category.deleteMany({}),
    prisma.categoryGroup.deleteMany({}),
    prisma.payee.deleteMany({}),
    prisma.passwordResetToken.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);
}
