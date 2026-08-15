import { prisma } from "../../../../../../shared/prisma/client";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { type UpdateCategoryGroupPayload } from "../../categorygroup.schema";
import { categoryGroupService } from "../../categoryGroup.service";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../categoryGroup.types";
import { type UpdateCategoryGroupResult } from "../../contracts/updateCategoryGroup.contract";

export type UpdateCategoryGroupCommand = Omit<
  UpdateCategoryGroupPayload,
  "userId" | "categoryGroupId"
> & {
  userId: UserId;
  categoryGroupId: CategoryGroupId;
  position?: number;
};

export const toUpdateCategoryGroupCommand = (
  p: UpdateCategoryGroupPayload
): UpdateCategoryGroupCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryGroupId: asCategoryGroupId(p.categoryGroupId),
  position: p.position,
});

/**
 * Updates a category group within a transaction, allowing either a rename or a reposition operation.
 *
 * Ensures the category group is modifiable before applying changes, then applies the requested
 * update (name and/or position) and returns the domain category group.
 */
export const updateCategoryGroup = async (
  payload: UpdateCategoryGroupPayload
): Promise<UpdateCategoryGroupResult> => {
  const { userId, categoryGroupId, name, position } =
    toUpdateCategoryGroupCommand(payload);

  return prisma.$transaction(async (tx) => {
    let categoryGroup = await categoryGroupService.getModifiableCategoryGroup(
      tx,
      userId,
      categoryGroupId
    );

    if (position !== undefined) {
      return categoryGroupService.repositionCategoryGroup(
        tx,
        userId,
        categoryGroup,
        position
      );
    }

    if (name !== undefined) {
      categoryGroup = await categoryGroupService.renameCategoryGroup(
        tx,
        categoryGroupId,
        name
      );
      return {
        updatedCategoryGroup: categoryGroup,
        affectedCategoryGroups: [],
      };
    }
    throw new Error("Need to either update position or name");
  });
};
