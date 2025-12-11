import { Prisma } from "@prisma/client";
import { PayeeRepository } from "../../features/budget/payee/payee.repository";
import { Payee } from "../../features/budget/payee/payee.types";

export const payeeRepository: PayeeRepository = {
  getPayees: function(
    tx: Prisma.TransactionClient,
    userId: string
  ): Promise<Payee[]> {
    return tx.payee.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  getPayeeByIdAndUserId: function(
    tx: Prisma.TransactionClient,
    payeeId: string,
    userId: string
  ): Promise<Payee | null> {
    return tx.payee.findUnique({
      where: {
        id: payeeId,
        userId: userId,
      },
    });
  },
  getPayeeByNameAndUserId: function(
    tx: Prisma.TransactionClient,
    userId: string,
    name: string,
    excludePayeeId?: string
  ): Promise<Payee | null> {
    return tx.payee.findFirst({
      where: {
        userId: userId,
        name: name,
        ...(excludePayeeId && { id: { not: excludePayeeId } }),
      },
    });
  },
  countPayeesByIdsAndUserId: async function(
    tx: Prisma.TransactionClient,
    payeeIds: string[],
    userId: string
  ): Promise<number> {
    return await tx.payee.count({
      where: {
        id: { in: payeeIds },
        userId,
      },
    });
  },

  createPayee: async function(
    tx: Prisma.TransactionClient,
    userId: string,
    name: string
  ): Promise<Payee> {
    return await tx.payee.create({
      data: {
        userId: userId,
        name: name,
      },
    });
  },

  updatePayee: async function(
    tx: Prisma.TransactionClient,
    payeeId: string,
    data: {
      name?: string;
      defaultCategoryId?: string | null;
      automaticallyCategorisePayee?: boolean;
      includeInPayeeList?: boolean;
    }
  ): Promise<void> {
    await tx.payee.update({
      where: {
        id: payeeId,
      },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.defaultCategoryId !== undefined && {
          defaultCategoryId: data.defaultCategoryId,
        }),
        ...(data.automaticallyCategorisePayee !== undefined && {
          automaticallyCategorisePayee: data.automaticallyCategorisePayee,
        }),
        ...(data.includeInPayeeList !== undefined && {
          includeInPayeeList: data.includeInPayeeList,
        }),
      },
    });
  },
  updatePayees: async function(
    tx: Prisma.TransactionClient,
    payeeIds: string[],
    data: {
      includeInPayeeList?: boolean;
    }
  ): Promise<void> {
    await tx.payee.updateMany({
      where: {
        id: { in: payeeIds },
      },
      data: {
        ...(data.includeInPayeeList !== undefined && {
          includeInPayeeList: data.includeInPayeeList,
        }),
      },
    });
  },
  deletePayees: async function(
    tx: Prisma.TransactionClient,
    payeeIds: string[]
  ): Promise<void> {
    await tx.payee.deleteMany({
      where: {
        id: { in: payeeIds },
      },
    });
  },
};
