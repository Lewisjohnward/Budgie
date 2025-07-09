import { prisma } from "../../../../shared/prisma/client";

export const getUser = async (email: string) => {
  return await prisma.user.findFirst({
    where: {
      email,
    },
  });
};
