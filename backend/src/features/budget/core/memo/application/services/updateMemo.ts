import { prisma } from "../../../../../../shared/prisma/client";
import { roundToStartOfMonth } from "../../../../../../shared/utils/roundToStartOfMonth";
import { UserId } from "../../../../../user/auth/auth.types";

const addMonths = (date: Date, count: number) => {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + count);
  return d;
};

export const ensureMemosContinuity = async (userId: UserId) => {
  const currentMonth = roundToStartOfMonth(new Date());

  const latestMemo = await prisma.monthMemo.findFirst({
    where: { userId },
    orderBy: { month: "desc" },
  });

  if (!latestMemo) {
    throw new Error("WHERE ARE THE MEMOS FOR THE USER!!");
  }

  const latestMonth = roundToStartOfMonth(latestMemo.month);

  // Build missing months
  const monthsToCreate: { userId: string; month: Date }[] = [];

  let cursor = latestMonth;

  while (true) {
    cursor = roundToStartOfMonth(addMonths(cursor, 1));

    if (cursor > currentMonth) break;

    monthsToCreate.push({
      userId,
      month: cursor,
    });
  }

  // Batch insert (skipDuplicates protects against race conditions)
  if (monthsToCreate.length > 0) {
    await prisma.monthMemo.createMany({
      data: monthsToCreate,
      skipDuplicates: true,
    });
  }
};
