import { Request, Response, NextFunction } from "express";
import { categoryGroupUseCase } from "./categorygroup.useCase";
import {
  createCategoryGroupSchema,
  deleteCategoryGroupSchema,
  editCategoryGroupSchema,
} from "./categorygroup.schema";

export const addCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedCategoryGroup = createCategoryGroupSchema.parse({
      userId: req.user!._id,
      ...req.body,
    });

    await categoryGroupUseCase.createCategoryGroup(validatedCategoryGroup);
    res.status(200).json({ message: "Category group added" });
  } catch (error) {
    next(error);
  }
};

export const editCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = editCategoryGroupSchema.parse({
      userId: req.user!._id,
      ...req.body,
    });

    await categoryGroupUseCase.editCategoryGroup(payload);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = deleteCategoryGroupSchema.parse({
      userId: req.user!._id,
      ...req.body,
    });

    await categoryGroupUseCase.deleteCategoryGroup(payload);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
