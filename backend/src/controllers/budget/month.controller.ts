import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  calculateChangeInAssignedForMonth,
  updateMonth,
  updateReadyToAssignMonths,
} from "../../utility/budget";
import { MonthSchema, UpdateMonthPayload } from "../../schemas/MonthSchema";

export const updateMonthForCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { assigned, monthId, assignId } = <UpdateMonthPayload>req.body;

  try {
    const validatedData = MonthSchema.parse({
      assigned,
      monthId,
      assignId,
    });

    const changeInAssigned = await calculateChangeInAssignedForMonth({
      monthId: validatedData.monthId,
      assigned: validatedData.assigned,
      userId: req.user?._id!,
    });

    await updateMonth({
      id: validatedData.monthId,
      assigned: validatedData.assigned,
      userId: req.user?._id!,
    });

    updateReadyToAssignMonths(assignId, changeInAssigned, req.user?._id!);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
  return;
};
