import { prisma } from "../../../../../../shared/prisma/client";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { type UpdateCategoryGroupPayload } from "../../categorygroup.schema";
import { categoryGroupService } from "../../categoryGroup.service";
import {
  asCategoryGroupId,
  CategoryGroupUserDto,
  type CategoryGroupId,
} from "../../categoryGroup.types";

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

export const updateCategoryGroup = async (
  payload: UpdateCategoryGroupPayload
): Promise<CategoryGroupUserDto> => {
  const { userId, categoryGroupId, name, position } =
    toUpdateCategoryGroupCommand(payload);

  return await prisma.$transaction(async (tx) => {
    await categoryGroupService.isProtectedCategoryGroup(
      tx,
      userId,
      categoryGroupId
    );

    const categoryGroup = await categoryGroupService.getUserCategoryGroup(
      tx,
      userId,
      categoryGroupId
    );

    // position: 0 is falsy
    if (typeof position === "number") {
      const updatedCategoryGroup =
        await categoryGroupService.repositionCategoryGroup(
          tx,
          userId,
          categoryGroup,
          position
        );
      return categoryGroupMapper.toCategoryGroupDto(updatedCategoryGroup);
    }

    if (name) {
      await categoryGroupService.checkCategoryGroupNameIsUnique(
        tx,
        userId,
        name
      );

      const dbCatGroup = await tx.categoryGroup.update({
        where: {
          id: categoryGroup.id,
        },
        data: {
          name: name,
        },
      });

      const domainCatGroup =
        categoryGroupMapper.toDomainUserCategoryGroup(dbCatGroup);

      return categoryGroupMapper.toCategoryGroupDto(domainCatGroup);
    }

    return categoryGroupMapper.toCategoryGroupDto(
      await categoryGroupService.getUserCategoryGroup(
        tx,
        userId,
        categoryGroupId
      )
    );
  });
};
