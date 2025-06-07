import { prisma } from "../../shared/prisma/client";

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
