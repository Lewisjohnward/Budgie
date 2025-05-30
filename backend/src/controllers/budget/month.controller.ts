import { NextFunction, Request, Response } from "express";
import {
  calculateChangeInAssignedForMonth,
  updateMonth,
  updateReadyToAssignMonths,
} from "../../utility";
import { MonthSchema, UpdateMonthPayload } from "../../schemas";
import { PrismaClient } from "@prisma/client";
import { AssigningToUncategorisedCategoryMonthError } from "../../errors";

const prisma = new PrismaClient();

export const updateMonthForCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { assigned, monthId} = <UpdateMonthPayload>req.body;

  try {

    const uncategorisedCategory = await prisma.category.findFirstOrThrow({
      where: {
        name: "Uncategorised Transactions",
        userId: req.user?._id!,
      },
      include: {
        months: true,
      },
    });

    const assignCategory = await prisma.category.findFirstOrThrow({
      where: {
        name: "Ready to Assign",
        userId: req.user?._id!,
      },
    });

    const monthsSet = new Set(uncategorisedCategory.months.map((month) => month.id));

    if (monthsSet.has(monthId)) {
      throw new AssigningToUncategorisedCategoryMonthError();
    }

    const validatedData = MonthSchema.parse({
      assigned,
      monthId,
      assignId: assignCategory.id,
    });


    const changeInAssigned = await calculateChangeInAssignedForMonth({
      assigned: validatedData.assigned,
      monthId: validatedData.monthId,
      userId: req.user?._id!,
    });

    await updateMonth({
      id: validatedData.monthId,
      assigned: validatedData.assigned,
      userId: req.user?._id!,
    });

    updateReadyToAssignMonths(validatedData.assignId, changeInAssigned, req.user?._id!);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
  return;
};
