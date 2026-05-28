import { type Prisma } from "@prisma/client";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { DomainUserCategoryGroup } from "../../categoryGroup.types";
import { UserId } from "../../../../../user/auth/auth.types";
import { CategoryId } from "../../../category/core/category.types";

export const deleteCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroup: DomainUserCategoryGroup,
  inheritingCategoryId?: CategoryId
): Promise<void> => { };
