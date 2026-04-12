import { type Prisma } from "@prisma/client";
import { type AuthRepository } from "../../features/user/auth/auth.repository";
import { type User } from "../../features/user/auth/types/user.prisma";
import { prisma } from "../prisma/client";
import {
  type CreateUserInput,
  type db,
  type UserId,
} from "../../features/user/auth/auth.types";

export const authRepository: AuthRepository = {
  findUserByEmail: async function(email: string): Promise<db.User | null> {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  updateRefreshToken: async function(
    userId: UserId,
    refreshToken: string | null
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  },

  findUserByRefreshToken: function(
    refreshToken: string
  ): Promise<User | null> {
    throw new Error("Function not implemented.");
  },

  createUser: async function(
    tx: Prisma.TransactionClient,
    user: CreateUserInput
  ): Promise<db.User> {
    return tx.user.create({
      data: { ...user },
    });
  },
};
