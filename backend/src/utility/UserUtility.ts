import { PrismaClient } from "@prisma/client";
import { RegisterUserInput } from "../dto";

const prisma = new PrismaClient();

export const userExists = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user !== null;
};

export const createUser = async (user: {
  email: string;
  password: string;
  salt: string;
}) => {
    await prisma.user.create({
      data: { ...user },
    });
};
