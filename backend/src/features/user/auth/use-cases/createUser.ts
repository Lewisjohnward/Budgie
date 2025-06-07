import { prisma } from "../../../../shared/prisma/client";

export const createUser = async (user: {
  email: string;
  password: string;
  salt: string;
}) => {
  return await prisma.user.create({
    data: { ...user },
  });
};
