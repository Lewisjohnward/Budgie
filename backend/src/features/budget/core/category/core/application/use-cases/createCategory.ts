import { prisma } from "../../../../../../../shared/prisma/client";
import { asUserId, type UserId } from "../../../../../../user/auth/auth.types";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../../../categorygroup/categoryGroup.types";
import { type CreateCategoryResult } from "../../category.contract";
import { type CreateCategoryPayload } from "../../category.schema";
import { categoryService } from "../../category.service";

export type CreateCategoryCommand = Omit<
  CreateCategoryPayload,
  "userId" | "categoryGroupId"
> & {
  userId: UserId;
  categoryGroupId: CategoryGroupId;
};

export const toCreateCategoryCommand = (
  p: CreateCategoryPayload
): CreateCategoryCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryGroupId: asCategoryGroupId(p.categoryGroupId),
});

/**
 * Orchestrates the creation of a budget category inside an ACID database transaction.
 * Validates ownership, calculates sequential ordering, and seeds corresponding budget months.
 * * @throws {ResourceNotFoundError} If the parent category group does not exist.
 * @throws {ForbiddenError} If the user does not have permission to modify the target category group.
 * @throws {DuplicateCategoryNameError} If a category with the same name already exists in the group.
 */
export const createCategory = async (
  payload: CreateCategoryPayload
): Promise<CreateCategoryResult> => {
  return await prisma.$transaction(async (tx) => {
    return categoryService.categories.createCategoryWithMonths(
      tx,
      toCreateCategoryCommand(payload)
    );
  });
};
