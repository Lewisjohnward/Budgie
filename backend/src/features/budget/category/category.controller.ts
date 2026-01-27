import { Request, Response, NextFunction } from "express";
import {
  createCategorySchema,
  editCategorySchema,
  deleteCategorySchema,
} from "./category.schema";
import { normaliseCategories } from "./utils/normaliseCategories";
import { categoryUseCase } from "./category.useCase";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryGroups, memos } = await categoryUseCase.getCategories(
      req.user!._id
    );
    const normalizedCategories = normaliseCategories(categoryGroups, memos);

    res.status(200).json(normalizedCategories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = createCategorySchema.parse({
      userId: req.user!._id,
      ...req.body,
    });
    await categoryUseCase.createCategory(payload);
    res.status(201).json({ message: "New category created" });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = editCategorySchema.parse({
      userId: req.user!._id,
      ...req.body,
    });

    await categoryUseCase.editCategory(payload);

    res.status(201).json({ message: "New category created" });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = deleteCategorySchema.parse({
      userId: req.user!._id,
      ...req.body,
    });

    await categoryUseCase.deleteCategory(payload);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
