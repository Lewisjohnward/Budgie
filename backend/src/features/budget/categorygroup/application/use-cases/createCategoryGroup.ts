import { prisma } from "../../../../../shared/prisma/client";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";
import { type CreateCategoryGroupPayload } from "../../categorygroup.schema";
import { categoryGroupService } from "../../categoryGroup.service";

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
): Promise<void> => {
  const { userId, name } = toCreateCategoryGroupCommand(payload);
  await prisma.$transaction(async (tx) => {
    const position = await categoryGroupService.getNextCategoryGroupPosition(
      tx,
      userId
    );

    await categoryGroupService.checkCategoryGroupNameIsUnique(tx, userId, name);

    const data = {
      ...payload,
      position,
    };

    await categoryGroupRepository.createCategoryGroup(tx, data);
  });
};
