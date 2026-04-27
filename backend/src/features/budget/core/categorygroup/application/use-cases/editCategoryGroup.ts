import { prisma } from "../../../../../../shared/prisma/client";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { type EditCategoryGroupPayload } from "../../categorygroup.schema";
import { categoryGroupService } from "../../categoryGroup.service";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../categoryGroup.types";

//  TODO: IMPLEMENT CHANGE POSITION
export type EditCategoryGroupCommand = Omit<
  EditCategoryGroupPayload,
  "userId" | "categoryGroupId"
> & {
  userId: UserId;
  categoryGroupId: CategoryGroupId;
};

export const toEditCategoryGroupCommand = (
  p: EditCategoryGroupPayload
): EditCategoryGroupCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryGroupId: asCategoryGroupId(p.categoryGroupId),
});

export const editCategoryGroup = async (
  payload: EditCategoryGroupPayload
): Promise<void> => {
  const { userId, categoryGroupId, name } = toEditCategoryGroupCommand(payload);

  if (!name) return;

  await prisma.$transaction(async (tx) => {
    await categoryGroupService.isProtectedCategoryGroup(
      tx,
      userId,
      categoryGroupId
    );

    await categoryGroupService.getCategoryGroup(tx, userId, categoryGroupId);

    if (name) {
      await categoryGroupService.checkCategoryGroupNameIsUnique(
        tx,
        userId,
        name
      );
    }

    await categoryGroupRepository.updateCategoryGroup(tx, payload);
  });
};
