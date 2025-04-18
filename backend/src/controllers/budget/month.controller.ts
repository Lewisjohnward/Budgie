import { Request, Response } from "express";
import { z } from "zod";
import {
  calculateChangeInAssignedForMonth,
  updateMonth,
  updateReadyToAssignMonths,
} from "../../utility/budget";
import { MonthSchema, UpdateMonthPayload } from "../../schemas/MonthSchema";

export const updateMonthForCategory = async (req: Request, res: Response) => {
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
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Malformed data" });
      return;
    }
    res
      .status(500)
      .json({ message: "There has been an error editing transaction" });
  }
  return;
};
