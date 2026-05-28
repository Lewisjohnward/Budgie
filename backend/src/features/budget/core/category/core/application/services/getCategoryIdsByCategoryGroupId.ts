import { Prisma } from "@prisma/client";
import { type CategoryId } from "../../category.types";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { type CategoryGroupId } from "../../../../categorygroup/categoryGroup.types";
import { categoryMapper } from "../../category.mapper";

/**
 * Retrieves all category IDs belonging to a specific category group.
 */
export const getCategoryIdsByCategoryGroupId = async (
  tx: Prisma.TransactionClient,
  categoryGroupId: CategoryGroupId
): Promise<CategoryId[]> => {
  const idsRaw = await categoryRepository.getCategoryIdsByCategoryGroupId(
    tx,
    categoryGroupId
  );

  return categoryMapper.toDomainCategoryIds(idsRaw);
};
