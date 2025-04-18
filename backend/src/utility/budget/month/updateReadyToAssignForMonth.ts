import { PrismaClient } from "@prisma/client";
import { convertDecimalToNumber } from "../helpers/convertDecimalToNumber";
import { getMonth } from "..";

const prisma = new PrismaClient();

export const updateReadyToAssignMonths = async (
  categoryId: string,
  amount: number,
  userId: string,
) => {
  const { startOfCurrentMonth } = getMonth();

  const assignedCurrentMonth = await prisma.month.findFirstOrThrow({
    where: {
      categoryId,
      category: {
        userId,
      },
      month: {
        gte: startOfCurrentMonth,
      },
    },
  });

  const oldAssignableAmount =
    convertDecimalToNumber(assignedCurrentMonth?.activity) || 0;

  const updatedAssignableAmount = oldAssignableAmount + amount;

  const updatedMonths = await prisma.month.updateMany({
    where: {
      categoryId,
      month: {
        gte: startOfCurrentMonth,
      },
    },
    data: {
      activity: updatedAssignableAmount,
    },
  });
};
