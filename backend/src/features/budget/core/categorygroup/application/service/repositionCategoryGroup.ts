import { Prisma } from "@prisma/client";
import { InvalidCategoryGroupPositionError } from "../../categoryGroup.errors";
import { type UserId } from "../../../../../user/auth/auth.types";
import { type DomainUserCategoryGroup } from "../../categoryGroup.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";

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
): Promise<DomainUserCategoryGroup> => {
  const fromPosition = categoryGroup.position;

  // If no change in position return category group
  if (toPosition === fromPosition) {
    return categoryGroup;
  }

  // Get the total number of category groups
  const count = await categoryGroupRepository.getUserCategoryGroupCount(
    tx,
    userId
  );

  // If position is less than 0 (ensured by schema)
  // or position is greater or above count throw error
  if (toPosition < 0 || toPosition >= count) {
    throw new InvalidCategoryGroupPositionError();
  }

  if (toPosition > fromPosition) {
    // Shift category groups down
    await categoryGroupRepository.shiftUserCategoryGroupsDown(
      tx,
      userId,
      fromPosition,
      toPosition
    );
  } else {
    // Shift category groups up
    await categoryGroupRepository.shiftUserCategoryGroupsUp(
      tx,
      userId,
      fromPosition,
      toPosition
    );
  }

  // Place moved group
  const updatedCategoryGroup =
    await categoryGroupRepository.updateCategoryGroupPosition(
      tx,
      categoryGroup.id,
      toPosition
    );

  return categoryGroupMapper.toDomainUserCategoryGroup(updatedCategoryGroup);
};
