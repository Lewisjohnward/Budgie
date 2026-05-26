import { Request, Response, NextFunction } from "express";
import { categoryGroupUseCase } from "./categorygroup.useCase";
import {
  createCategoryGroupSchema,
  deleteCategoryGroupSchema,
  updateCategoryGroupSchema,
} from "./categorygroup.schema";

/** Retrieves a user's category groups and returns them as a normalised record response */
export const getCategoryGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!._id;
  try {
    const normalisedCategoryGroups =
      await categoryGroupUseCase.getCategoryGroups(userId);
    res.status(200).json({ ...normalisedCategoryGroups });
  } catch (error) {
    next(error);
  }
  return;
};

export const createCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedCategoryGroup = createCategoryGroupSchema.parse({
      userId: req.user!._id,
      ...req.body,
    });

    const categoryGroup = await categoryGroupUseCase.createCategoryGroup(
      validatedCategoryGroup
    );
    res.status(200).json(categoryGroup);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a category group for the authenticated user and returns the updated result.
 */
export const updateCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = updateCategoryGroupSchema.parse({
      userId: req.user!._id,
      ...req.body,
    });

    const updatedCategoryGroup =
      await categoryGroupUseCase.updateCategoryGroup(payload);
    res.status(201).json(updatedCategoryGroup);
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
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
