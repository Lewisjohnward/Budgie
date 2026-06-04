import { Request, Response, NextFunction } from "express";
import { categoryGroupUseCase } from "./categorygroup.useCase";
import {
  createCategoryGroupSchema,
  deleteCategoryGroupSchema,
  updateCategoryGroupSchema,
} from "./categorygroup.schema";
import { categoryGroupMapper } from "./categorygroup.mapper";

/**
 * Retrieves a user's category groups and returns them as a normalised record response.
 */
export const getCategoryGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user!._id;
  try {
    const normalisedCategoryGroups =
      await categoryGroupUseCase.getCategoryGroups(userId);
    res.status(200).json({ ...normalisedCategoryGroups });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new category group.
 */
export const createCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = createCategoryGroupSchema.parse({
      userId: req.user!._id,
      ...req.body,
    });

    const result = await categoryGroupUseCase.createCategoryGroup(payload);

    const dto = categoryGroupMapper.toCategoryGroupUserDto(result);

    res.status(201).json(dto);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a category group and returns the updated result.
 */
export const updateCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const categoryGroupId = req.params.id;

  try {
    const payload = updateCategoryGroupSchema.parse({
      ...req.body,
      userId: req.user!._id,
      categoryGroupId: categoryGroupId,
    });

    const result = await categoryGroupUseCase.updateCategoryGroup(payload);

    const dto = categoryGroupMapper.toCategoryGroupUserDto(result);

    res.status(200).json(dto);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a category group and returns the updated result.
 */
export const deleteCategoryGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const categoryGroupId = req.params.id;
  try {
    const payload = deleteCategoryGroupSchema.parse({
      ...req.body,
      userId: req.user!._id,
      categoryGroupId: categoryGroupId,
    });

    const result = await categoryGroupUseCase.deleteCategoryGroup(payload);

    const dto = categoryGroupMapper.toDeleteCategoryGroupDto(result);

    res.status(200).json(dto);
  } catch (error) {
    next(error);
  }
};
