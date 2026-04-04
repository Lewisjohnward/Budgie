import { NextFunction, Request, Response } from "express";
import { assignSchema, getMonthsForCategoriesSchema } from "./assign.schema";
import { assignUseCase } from "./assign.useCase";

export const updateMonthForCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
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

/**
 * Controller for fetching months by category IDs.
 *
 * Validates request input, ensures the user owns the categories,
 * and returns the corresponding months as domain objects.
 */
export const getMonthsForCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const categoryIds = req.query.categoryIds;

  try {
    const payload = getMonthsForCategoriesSchema.parse({
      userId: req.user!._id,
      categoryIds,
    });

    const months = await assignUseCase.getMonthsForCategories(payload);

    res.status(200).json(months);
  } catch (error) {
    next(error);
  }
  return;
};
