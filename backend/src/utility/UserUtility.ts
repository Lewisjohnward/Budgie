import { PrismaClient } from "@prisma/client";

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
  await prisma.user.create({
    data: { ...user },
  });
};

export const updateRefreshToken = async (
  email: string,
  refreshToken: string,
) => {
  try {
    return await prisma.user.update({
      where: { email },
      data: { refreshToken },
    });
  } catch (error) {
    console.error("Error updating refresh token for user:", email, error);
    throw new Error("Could not update refresh token");
  }
};
