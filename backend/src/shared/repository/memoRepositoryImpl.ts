import { Prisma } from "@prisma/client";
import { MemoRepository } from "../../features/budget/memo/memo.repository";
import { Memo } from "../../features/budget/memo/memo.types";

export const memoRepository: MemoRepository = {
  getMemo: async function(
    tx: Prisma.TransactionClient,
    userId: string,
    id: string
  ): Promise<Memo | null> {
    const memo = await tx.monthMemo.findFirst({
      where: {
        userId: userId,
        id,
      },
    });

    return memo;
  },
  updateMemo: async function(
    tx: Prisma.TransactionClient,
    id: string,
    content: string
  ): Promise<Memo> {
    return await tx.monthMemo.update({
      where: {
        id,
      },
      data: {
        content,
      },
    });
  },

  insertMemos: async function(tx, userId, months) {
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
