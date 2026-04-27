import { Prisma } from "@prisma/client";
import { MemoRepository } from "../../features/budget/core/memo/memo.repository";
import { db, type MemoId } from "../../features/budget/core/memo/memo.types";
import { type UserId } from "../../features/user/auth/auth.types";
import { prisma } from "../prisma/client";

export const memoRepository: MemoRepository = {
  getMemo: async function (
    tx: Prisma.TransactionClient,
    userId: UserId,
    memoId: MemoId
  ): Promise<db.Memo | null> {
    const memo = await tx.monthMemo.findFirst({
      where: {
        userId: userId,
        id: memoId,
      },
    });

    return memo;
  },
  getMemos: async function (userId: UserId): Promise<db.Memo[]> {
    return prisma.monthMemo.findMany({
      where: {
        userId: userId,
      },
    });
  },
  updateMemo: async function (
    tx: Prisma.TransactionClient,
    memoId: MemoId,
    content: string
  ): Promise<db.Memo> {
    return await tx.monthMemo.update({
      where: {
        id: memoId,
      },
      data: {
        content,
      },
    });
  },

  insertMemos: async function (tx, userId, months) {
    await tx.monthMemo.createMany({
      data: months.map((m) => ({
        userId,
        month: m,
        content: "",
      })),
      skipDuplicates: true,
    });
  },

  async getEarliestMemoMonth(tx, userId) {
    const earliestMemo = await tx.monthMemo.findFirst({
      where: { userId },
      orderBy: { month: "asc" },
      select: { month: true },
    });

    return earliestMemo?.month ?? null;
  },
};
