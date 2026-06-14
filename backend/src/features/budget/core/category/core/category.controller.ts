import { Request, Response, NextFunction } from "express";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from "./category.schema";
import { normaliseCategories } from "./utils/normaliseCategories";
import { categoryUseCase } from "./category.useCase";
import { categoryMapper } from "./category.mapper";

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
    const result = await categoryUseCase.createCategory(payload);

    const dto = categoryMapper.toCreateCategoryDto(result);

    res.status(201).json(dto);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const categoryId = req.params.id;
  try {
    const payload = updateCategorySchema.parse({
      ...req.body,
      userId: req.user!._id,
      categoryId,
    });

    const updatedCategory = await categoryUseCase.updateCategory(payload);

    const dto = categoryMapper.toCategoryDto(updatedCategory);

    res.status(200).json(dto);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const categoryId = req.params.id;
  try {
    const payload = deleteCategorySchema.parse({
      ...req.body,
      userId: req.user!._id,
      categoryId,
    });

    const result = await categoryUseCase.deleteCategory(payload);

    const dto = categoryMapper.toDeleteCategoryDto(result);

    res.status(200).json(dto);
  } catch (error) {
    next(error);
  }
};
