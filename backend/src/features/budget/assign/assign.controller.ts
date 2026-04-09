import { type NextFunction, type Request, type Response } from "express";
import {
  assignmentsSchema,
  getMonthsForCategoriesSchema,
} from "./assign.schema";
import { assignUseCase } from "./assign.useCase";

/**
 * Updates month assignments for categories and returns the updated data.
 */
export const updateMonthForCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = assignmentsSchema.parse({
      userId: req.user?._id!,
      ...req.body,
    });

    const updatedMonthsByCategory = await assignUseCase.updateMonths(payload);

    res.status(200).json(updatedMonthsByCategory);
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
