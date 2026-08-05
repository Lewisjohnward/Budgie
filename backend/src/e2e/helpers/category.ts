import { type Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { categoryService } from "../../features/budget/core/category/core/category.service";
import {
  type DomainUserCategory,
  type DomainMonth,
  type MonthId,
} from "../../features/budget/core/category/core/category.types";
import { assignService } from "../../features/budget/core/category/months/month.service";
import { categoryGroupService } from "../../features/budget/core/categorygroup/categoryGroup.service";
import {
  type DomainUserCategoryGroup,
  type CategoryGroupId,
} from "../../features/budget/core/categorygroup/categoryGroup.types";
import { type UserId } from "../../features/user/auth/auth.types";

type CreatedCategory = {
  category: DomainUserCategory;
  months: DomainMonth[];
};

type CategoryGroupWithCategories = {
  categoryGroup: DomainUserCategoryGroup;
  categories: Record<string, CreatedCategory>;
};

type CreateCategoryWithCategoriesOptions = {
  categoryGroupName: string;
  categoryNames: string[];
};

export const createCategoryGroupWithCategories = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  options: CreateCategoryWithCategoriesOptions
): Promise<CategoryGroupWithCategories> => {
  const categoryGroup = await createCategoryGroup(
    tx,
    userId,
    options.categoryGroupName
  );

  const categories = Object.fromEntries(
    await Promise.all(
      options.categoryNames.map(async (name) => {
        const { category, months } = await createCategory(tx, userId, {
          categoryGroupId: categoryGroup.id,
          name,
        });

        return [
          name,
          {
            category,
            months,
          },
        ] as const;
      })
    )
  );

  return {
    categoryGroup,
    categories,
  };
};

export const createCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  name: string
): Promise<DomainUserCategoryGroup> => {
  const categoryGroup = await categoryGroupService.createCategoryGroup(tx, {
    userId,
    name,
  });

  return categoryGroup;
};

type CreateCategoryOptions = {
  categoryGroupId: CategoryGroupId;
  name: string;
};

export const createCategory = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  options: CreateCategoryOptions
): Promise<CreatedCategory> => {
  const { createdCategory, createdMonths } =
    await categoryService.categories.createCategoryWithMonths(tx, {
      userId,
      categoryGroupId: options.categoryGroupId,
      name: options.name,
    });

  return { category: createdCategory, months: createdMonths };
};

type AssignToMonthOptions = {
  monthId: MonthId;
  amount: number;
};

export const assignToMonth = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  options: AssignToMonthOptions
): Promise<void> => {
  await assignService.updateMonths(tx, {
    userId: userId,
    assignments: [
      { assigned: new Decimal(options.amount), monthId: options.monthId },
    ],
  });
};
