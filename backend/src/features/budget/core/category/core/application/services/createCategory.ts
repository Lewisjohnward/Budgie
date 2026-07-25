import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { DuplicateCategoryNameError } from "../../category.errors";
import { categoryMapper } from "../../category.mapper";
import { type CreateCategoryData } from "../../category.schema";
import { type DomainUserCategory } from "../../category.types";

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
 * @returns A fully mapped `DomainUserCategory` representing the newly created user category
 */
export const createCategory = async (
  tx: Prisma.TransactionClient,
  categoryData: CreateCategoryData
): Promise<DomainUserCategory> => {
  try {
    const rawCategory = await categoryRepository.createCategory(
      tx,
      categoryData
    );

    return categoryMapper.toDomainUserCategory(rawCategory);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateCategoryNameError();
    }

    throw error;
  }
};
