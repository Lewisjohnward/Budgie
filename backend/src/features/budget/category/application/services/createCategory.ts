import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { Prisma } from "@prisma/client";
import { type DomainCategory } from "../../category.types";
import { categoryMapper } from "../../category.mapper";
import { CreateCategoryData } from "../../category.schema";

/**
 * Creates a new category and maps the persisted record to a domain entity.
 *
 * This function delegates persistence to the repository layer, which
 * inserts the category into the database within the provided transaction.
 * The resulting database model is then transformed into a
 * `DomainCategory` using the category mapper.
 *
 * The function assumes all required validation (e.g. ownership checks,
 * uniqueness constraints, protection rules) has already been performed
 * by the calling layer.
 *
 * @param tx - Prisma transaction client used to execute the creation
 * within an active transaction
 * @param categoryData - Data required to create the category in the database
 *
 * @returns A fully mapped `DomainCategory` representing the newly created category
 */

export const createCategory = async (
  tx: Prisma.TransactionClient,
  categoryData: CreateCategoryData
): Promise<DomainCategory> => {
  const rawCategory = await categoryRepository.createCategory(tx, categoryData);

  return categoryMapper.toDomainCategory(rawCategory);
};
