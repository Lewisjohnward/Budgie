import { Request, Response, NextFunction } from "express";
import {
  createCategory,
  createCategoryGroup,
  normalizeCategories,
  selectCategories,
} from "../../utility";
import {
  CategoryGroupSchema,
  CategorySchema,
} from "../../schemas/CategorySchema";
// TODO: NEEDS TESTING

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await selectCategories(req.user?._id!);
    const normalizedCategories = normalizeCategories(categories);

    res.status(200).json({ ...normalizedCategories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
  return;
};

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

    await createCategoryGroup(validatedCategoryGroup);
    res.status(200).json({ message: "Category group added" });
  } catch (error) {
    res.status(500).json({ message: error });
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

// TODO: NEEDS TESTING
export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, categoryGroupId } = req.body;

  try {
    const validatedSubCategory = CategorySchema.parse({
      userId: req.user!._id,
      categoryGroupId,
      name,
    });

    await createCategory(validatedSubCategory);
    res.status(200).json({ message: "SubCategory added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
  return;
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};

// TODO: NEEDS TESTING
export const editCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {}
  return;
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {}
  return;
};
