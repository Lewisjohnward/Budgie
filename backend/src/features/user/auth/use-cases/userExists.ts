import { prisma } from "../../../../shared/prisma/client";

export const userExists = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user !== null;
};
