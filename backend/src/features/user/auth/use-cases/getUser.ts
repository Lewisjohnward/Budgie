import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../../shared/prisma/client";

export const getUser = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};
