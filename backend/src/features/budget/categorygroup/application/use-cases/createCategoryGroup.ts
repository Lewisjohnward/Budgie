import { prisma } from "../../../../../shared/prisma/client";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { CreateCategoryGroupPayload } from "../../categorygroup.schema";
import { categoryGroupService } from "../../categoryGroup.service";

export const createCategoryGroup = async (
  payload: CreateCategoryGroupPayload,
) => {
  const { userId, name } = payload;
  await prisma.$transaction(async (tx) => {
    const position = await categoryGroupService.getNextCategoryGroupPosition(
      tx,
      userId,
    );

    await categoryGroupService.checkCategoryGroupNameIsUnique(tx, userId, name);

    const data = {
      ...payload,
      position,
    };

    await categoryGroupRepository.createCategoryGroup(tx, data);
  });
};
