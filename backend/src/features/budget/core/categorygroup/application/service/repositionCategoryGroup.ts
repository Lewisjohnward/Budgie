import { Prisma } from "@prisma/client";
import { InvalidCategoryGroupPositionError } from "../../categoryGroup.errors";
import { type UserId } from "../../../../../user/auth/auth.types";
import { type DomainUserCategoryGroup } from "../../categoryGroup.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";

export type RepositionCategoryGroupResult = {
  updatedCategoryGroup: DomainUserCategoryGroup;
  affectedCategoryGroups: DomainUserCategoryGroup[];
};

/**
 * Repositions a user-owned category group within its ordered list.
 *
 * Validates the target position, shifts surrounding groups accordingly,
 * and updates the moved category group's position within a transaction.
 */
export const repositionCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroup: DomainUserCategoryGroup,
  toPosition: number
): Promise<RepositionCategoryGroupResult> => {
  const fromPosition = categoryGroup.position;

  // Get the total number of category groups.
  const count = await categoryGroupRepository.getUserCategoryGroupCount(
    tx,
    userId
  );

  // Position must be within the existing group list.
  if (toPosition < 0 || toPosition >= count) {
    throw new InvalidCategoryGroupPositionError();
  }

  // No position change.
  if (toPosition === fromPosition) {
    return {
      updatedCategoryGroup: categoryGroup,
      affectedCategoryGroups: [],
    };
  }

  if (toPosition > fromPosition) {
    // Shift category groups down.
    await categoryGroupRepository.shiftUserCategoryGroupsDown(
      tx,
      userId,
      fromPosition,
      toPosition
    );
  } else {
    // Shift category groups up.
    await categoryGroupRepository.shiftUserCategoryGroupsUp(
      tx,
      userId,
      fromPosition,
      toPosition
    );
  }

  // Place the moved group in its new position.
  const updatedCategoryGroup =
    await categoryGroupRepository.updateCategoryGroupPosition(
      tx,
      categoryGroup.id,
      toPosition
    );

  // Fetch the final state of all user category groups.
  const categoryGroups = await categoryGroupRepository.getUserCategoryGroups(
    tx,
    userId
  );

  return {
    updatedCategoryGroup:
      categoryGroupMapper.toDomainUserCategoryGroup(updatedCategoryGroup),

    affectedCategoryGroups: categoryGroups.map(
      categoryGroupMapper.toDomainUserCategoryGroup
    ),
  };
};
