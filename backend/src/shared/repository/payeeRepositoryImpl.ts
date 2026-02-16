import { Prisma } from "@prisma/client";
import { PayeeRepository } from "../../features/budget/payee/payee.repository";
import { type PayeeId, type db } from "../../features/budget/payee/payee.types";
import { type UserId } from "../../features/user/auth/auth.types";
import { SYSTEM_PAYEE_NAMES } from "../../features/budget/payee/payee.constants";

export const payeeRepository: PayeeRepository = {
  getPayees: function(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<db.Payee[]> {
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
    payeeId: PayeeId,
    userId: UserId
  ): Promise<db.Payee | null> {
    return tx.payee.findUnique({
      where: {
        id: payeeId,
        userId: userId,
      },
    });
  },
  getPayeeByNameAndUserId: function(
    tx: Prisma.TransactionClient,
    userId: UserId,
    name: string,
    excludePayeeId?: PayeeId
  ): Promise<db.Payee | null> {
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
    payeeIds: PayeeId[],
    userId: UserId
  ): Promise<number> {
    return await tx.payee.count({
      where: {
        id: { in: payeeIds },
        userId,
      },
    });
  },

  getSystemPayeeIdsByUserId: async function(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<string[]> {
    const rows = await tx.payee.findMany({
      where: {
        userId,
        name: { in: [...SYSTEM_PAYEE_NAMES] },
      },
      select: {
        id: true,
      },
    });
    return rows.map((r) => r.id);
  },

  createPayee: async function(
    tx: Prisma.TransactionClient,
    userId: UserId,
    name: string,
    origin: "USER" | "SYSTEM"
  ): Promise<db.Payee> {
    return await tx.payee.create({
      data: {
        userId: userId,
        name: name,
        origin,
      },
    });
  },

  updatePayee: async function(
    tx: Prisma.TransactionClient,
    payeeId: PayeeId,
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
    payeeIds: PayeeId[],
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
    payeeIds: PayeeId[]
  ): Promise<void> {
    await tx.payee.deleteMany({
      where: {
        id: { in: payeeIds },
      },
    });
  },

  getStartingBalancePayeeId: async function(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<string | null> {
    const record = await tx.payee.findUnique({
      where: {
        userId_name: {
          name: "Starting Balance",
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!record) return null;
    return record.id;
  },

  getBalanceAdjustmentPayeeId: async function(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<string | null> {
    const record = await tx.payee.findUnique({
      where: {
        userId_name: {
          name: "Manual Balance Adjustment",
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!record) return null;

    return record.id;
  },

  // Note: Using `createPayee` in a loop returns the created payees.
  // `createMany` does not return the created records
  createPayees: async function(
    tx: Prisma.TransactionClient,
    userId: UserId,
    payees: { name: string; origin: "USER" | "SYSTEM" }[]
  ): Promise<db.Payee[]> {
    const created: db.Payee[] = [];

    for (const { name, origin } of payees) {
      const payee = await this.createPayee(tx, userId, name, origin);
      created.push(payee);
    }

    return created;
  },
};
