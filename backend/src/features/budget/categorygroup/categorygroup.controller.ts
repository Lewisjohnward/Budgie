import { Request, Response, NextFunction } from "express";
import { categoryGroupUseCase } from "./categorygroup.useCase";
import { CategoryGroupSchema } from "./categorygroup.schema";

export const addCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name } = req.body;

  // TODO: when adding a category need to add current month and next month

  try {
    const validatedCategoryGroup = CategoryGroupSchema.parse({
      userId: req.user!._id,
      name,
    });

    await categoryGroupUseCase.createCategoryGroup(validatedCategoryGroup);
    res.status(200).json({ message: "Category group added" });
  } catch (error) {
    next(error);
  }
  return;
};

export const editCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.sendStatus(200);
};

export const deleteCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.sendStatus(200);
};
