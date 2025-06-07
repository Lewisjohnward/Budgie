import { Request, Response, NextFunction } from "express";
import { categoryService } from "./category.service";
import {
  updateCategorySchema,
  categoryParamsSchema,
  CategorySchema,
} from "./category.schema";
import { normaliseCategories } from "./utils/normaliseCategories";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.getCategories(req.user!._id);
    const normalizedCategories = normaliseCategories(categories);
    res.status(200).json({ ...normalizedCategories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = CategorySchema.parse({
      userId: req.user!._id,
      ...req.body,
    });
    const newCategory = await categoryService.createCategory(payload);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = categoryParamsSchema.parse(req.params);
    const payload = updateCategorySchema.parse(req.body);
    // const updatedCategory = await categoryService.updateCategory(
    //   req.user!._id,
    //   categoryId,
    //   payload,
    // );
    // res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = categoryParamsSchema.parse(req.params);
    await categoryService.deleteCategory(req.user!._id, categoryId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
