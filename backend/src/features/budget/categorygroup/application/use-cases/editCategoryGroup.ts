import { prisma } from "../../../../../shared/prisma/client";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { CategoryGroupNotFoundError } from "../../categoryGroup.errors";
import { EditCategoryGroupPayload } from "../../categorygroup.schema";
import { categoryGroupService } from "../../categoryGroup.service";

//  TODO: IMPLEMENT CHANGE POSITION
export const editCategoryGroup = async (payload: EditCategoryGroupPayload) => {
  const { userId, categoryGroupId, name } = payload;

  if (!name) return;

  await prisma.$transaction(async (tx) => {
    await categoryGroupService.isProtectedCategoryGroup(
      tx,
      userId,
      categoryGroupId,
    );

    const categorygroup = await categoryGroupRepository.getCategoryGroup(
      tx,
      userId,
      categoryGroupId,
    );

    if (!categorygroup) {
      throw new CategoryGroupNotFoundError();
    }

    if (name) {
      await categoryGroupService.checkCategoryGroupNameIsUnique(
        tx,
        userId,
        name,
      );
    }

    await categoryGroupRepository.updateCategoryGroup(tx, payload);
  });
};
