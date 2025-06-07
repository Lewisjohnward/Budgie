import { NextFunction, Request, Response } from "express";
import { Decimal } from "@prisma/client/runtime/library";
import { AssignSchema } from "./assign.schema";
import { roundToStartOfMonth } from "../../../shared/utils/roundToStartOfMonth";
import { calculateCategoryMonths } from "../../../shared/utils/calculateCategoryMonths";
import { groupMonthlyAssignedNegativeAvailable } from "../../../shared/utils/groupMonthlyAssignedNegativeAvailable";
import { calculateRtaAvailablePerMonth } from "../../../shared/utils/calculateRtaAvailablePerMonth";
import { AssigningToUncategorisedCategoryMonthError } from "./assign.errors";
import { prisma } from "../../../shared/prisma/client";
import { calculateStartOfPreviousMonth } from "../../../shared/utils/calculateStartOfPreviousMonth";

export const updateMonthForCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?._id!;

  try {
    // validate data
    const { assigned, monthId } = AssignSchema.parse(req.body);

    // get uncategorised category
    const uncategorisedCategory = await prisma.category.findFirstOrThrow({
      where: {
        name: "Uncategorised Transactions",
        userId,
      },
      include: {
        months: true,
      },
    });

    // get rta category
    const rtaCategory = await prisma.category.findFirstOrThrow({
      where: {
        name: "Ready to Assign",
        userId,
      },
    });

    // TODO: THIS IS INCORRECT,
    // make sure user doesn't assign to ready to assign
    const monthsSet = new Set(
      uncategorisedCategory.months.map((month) => month.id),
    );

    // make sure user doesn't assign to ready to assign
    if (monthsSet.has(monthId)) {
      throw new AssigningToUncategorisedCategoryMonthError();
    }

    // find the month that needs updating
    const monthForCategoryToUpdate = await prisma.month.findUniqueOrThrow({
      where: {
        id: monthId,
        category: {
          userId,
        },
      },
    });

    // get all months that are greater than current for the category
    const futureMonthsForCategory = await prisma.month.findMany({
      where: {
        categoryId: monthForCategoryToUpdate.categoryId,
        month: {
          gt: monthForCategoryToUpdate.month,
        },
      },
    });

    // get previous rta month
    const startOfPreviousMonth = calculateStartOfPreviousMonth(
      monthForCategoryToUpdate.month,
    );
    // get previous month for category (may not exist)
    const previousMonthForCategory = await prisma.month.findFirst({
      where: {
        categoryId: monthForCategoryToUpdate.categoryId,
        month: {
          equals: roundToStartOfMonth(startOfPreviousMonth),
        },
      },
    });

    // get rta months from category month date
    const rtaMonths = await prisma.month.findMany({
      where: {
        categoryId: rtaCategory.id,
      },
      orderBy: {
        month: "asc",
      },
    });

    const previousMonthAvailable =
      previousMonthForCategory?.available || new Decimal(0);

    // calculate the change in assigned for the month
    const changeInAssigned = new Decimal(assigned).sub(
      monthForCategoryToUpdate.assigned,
    );
    // update available for month
    const updatedAvailable =
      monthForCategoryToUpdate.available.add(changeInAssigned);
    // update month object
    const updatedMonthForCategory = {
      ...monthForCategoryToUpdate,
      assigned: new Decimal(assigned),
      available: updatedAvailable,
    };

    const updatedMonthsForCategory = calculateCategoryMonths(
      [updatedMonthForCategory, ...futureMonthsForCategory],
      previousMonthAvailable,
    );

    await Promise.all(
      updatedMonthsForCategory.map((m) =>
        prisma.month.update({
          where: {
            id: m.id,
          },
          data: {
            assigned: m.assigned,
            activity: m.activity,
            available: m.available,
          },
        }),
      ),
    );

    // calculate the new rta for each month from the changed month
    const allCategoryMonths = await prisma.month.findMany({
      where: {
        category: { userId },
        categoryId: { not: rtaCategory.id },
      },
      orderBy: { month: "asc" },
    });

    // group category groups by total negative per month
    const monthlyAssignedNegativeAvailable =
      groupMonthlyAssignedNegativeAvailable(allCategoryMonths);

    const updatedRtaMonths = calculateRtaAvailablePerMonth(
      rtaMonths,
      monthlyAssignedNegativeAvailable,
    );

    await Promise.all(
      updatedRtaMonths.map(
        async (m) =>
          await prisma.month.update({
            where: {
              id: m.id,
            },
            data: {
              activity: m.activity,
              available: m.available,
            },
          }),
      ),
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
  return;
};
