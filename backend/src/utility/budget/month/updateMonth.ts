import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateMonth = async ({
  id,
  assigned,
  userId,
}: {
  id: string;
  assigned: number;
  userId: string;
}) => {
  await prisma.month.update({
    where: {
      id,
      category: {
        userId,
      },
    },
    data: {
      assigned,
    },
  });
};
