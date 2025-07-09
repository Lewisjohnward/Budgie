import { NextFunction, Request, Response } from "express";
import { assignSchema } from "./assign.schema";
import { assignUseCase } from "./assign.useCase";

export const updateMonthForCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = assignSchema.parse({
      userId: req.user?._id!,
      ...req.body,
    });

    await assignUseCase.updateCategoryMonthAssignment(payload);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
  return;
};
