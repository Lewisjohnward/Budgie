import { CategoryGroup, Prisma } from "@prisma/client";
import {
  CreateCategoryGroupData,
  EditCategoryGroupData,
} from "./categorygroup.schema";

export interface CategoryGroupRepository {
  getCategoryGroup(
    tx: Prisma.TransactionClient,
    userId: string,
    categoryGroupId: string,
  ): Promise<CategoryGroup | null>;

  getCategoryGroupId(
    tx: Prisma.TransactionClient,
    userId: string,
    categoryGroupId: string,
  ): Promise<string | null>;

  getProtectedCategoryGroupIds(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<string[]>;

  getCategoryGroupIdByName(
    tx: Prisma.TransactionClient,
    userId: string,
    name: string,
  ): Promise<string | null>;

  createCategoryGroup(
    tx: Prisma.TransactionClient,
    categoryGroup: CreateCategoryGroupData,
  ): Promise<void>;

  updateCategoryGroup(
    tx: Prisma.TransactionClient,
    categoryGroup: EditCategoryGroupData,
  ): Promise<void>;

  deleteCategoryGroup(
    tx: Prisma.TransactionClient,
    categoryGroupId: string,
  ): Promise<void>;
}
