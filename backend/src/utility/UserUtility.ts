import { PrismaClient } from "@prisma/client";
import { registerUserSchema } from "../schemas";

const prisma = new PrismaClient();

export const userExists = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user !== null;
};

export const getUser = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUser = async (user: {
  email: string;
  password: string;
  salt: string;
}) => {
  return await prisma.user.create({
    data: { ...user },
  });
};

export const updateRefreshToken = async (
  email: string,
  refreshToken: string,
) => {
  return await prisma.user.update({
    where: { email },
    data: { refreshToken },
  });
};

export const validateCredentials = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return registerUserSchema.parse({ email, password });
};
