import { prisma } from "../../../../../../shared/prisma/client";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { type CreateCategoryGroupPayload } from "../../categorygroup.schema";
import { categoryGroupService } from "../../categoryGroup.service";
import { CategoryGroupUserDto } from "../../categoryGroup.types";

export type CreateCategoryGroupCommand = Omit<
  CreateCategoryGroupPayload,
  "userId"
> & {
  userId: UserId;
};

export const toCreateCategoryGroupCommand = (
  p: CreateCategoryGroupPayload
): CreateCategoryGroupCommand => ({
  ...p,
  userId: asUserId(p.userId),
});

export const createCategoryGroup = async (
  payload: CreateCategoryGroupPayload
): Promise<CategoryGroupUserDto> => {
  const { userId, name } = toCreateCategoryGroupCommand(payload);
  return await prisma.$transaction(async (tx) => {
    const createdCategoryGroup = await categoryGroupService.createCategoryGroup(
      tx,
      { userId, name }
    );
    return categoryGroupMapper.toCategoryGroupDto(createdCategoryGroup);
  });
};
