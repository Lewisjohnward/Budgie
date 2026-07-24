import {
  DeleteCategoryGroupDto,
  type ApiBudgetSnapshot,
} from "@/core/types/exported-types";
import {
  type CategoryGroupBranded,
  type MonthBranded,
  type CategoryBranded,
  type TransactionBranded,
} from "@/core/types/NormalizedData";
import { type CategoryId } from "../../../types/types";
import { rtaCategoryIdTest } from "./createBudgetSnapshot";

export function calculateDeleteCategoryGroupResult(
  snapshot: ApiBudgetSnapshot,
  categoryGroupId: string,
  inheritingCategoryId?: string
): DeleteCategoryGroupDto {
  // get category group
  const categoryGroup = snapshot.categoryGroups.user[
    categoryGroupId
  ] as CategoryGroupBranded;

  // get categories belonging to group
  const categoriesToDelete = Object.values(snapshot.categories.user).filter(
    (c) => c.categoryGroupId === categoryGroup.id
  );

  // sort months by category id
  const monthsByCategoryId = Object.values(snapshot.months).reduce(
    (acc, month) => {
      if (!acc[month.categoryId]) {
        acc[month.categoryId] = [];
      }

      acc[month.categoryId].push(month as MonthBranded);

      return acc;
    },
    {} as Record<string, MonthBranded[]>
  );

  // get months to delete
  const monthsToDelete = categoriesToDelete.flatMap(
    (category) => monthsByCategoryId[category.id] ?? []
  );

  // clone user categories
  const updatedCategories = { ...snapshot.categories.user } as Record<
    string,
    CategoryBranded
  >;

  // delete categories
  for (const category of categoriesToDelete) {
    delete updatedCategories[category.id];
  }

  // calculate total assigned for deleted months
  const assignedTotal = monthsToDelete.reduce((sum, m) => sum + m.assigned, 0);

  // get rtaMonthId
  const rtaMonthId = Object.keys(snapshot.months).find(
    (id) => snapshot.months[id].categoryId === rtaCategoryIdTest
  );

  const updatedMonths = structuredClone(snapshot.months);

  const updatedTransactions = structuredClone(snapshot.transactions) as Record<
    string,
    TransactionBranded
  >;

  //-----
  // Reassign transactions + month values
  //-----
  if (inheritingCategoryId) {
    const deletedMonth = Object.values(monthsToDelete)[0];

    const inheritingMonth = Object.values(updatedMonths).find(
      (month) => month.categoryId === inheritingCategoryId
    );
    //

    if (deletedMonth && inheritingMonth) {
      inheritingMonth.activity += deletedMonth.activity;
      inheritingMonth.available += deletedMonth.activity;
    }

    const categoryIds = new Set(categoriesToDelete.map((c) => c.id));

    Object.values(updatedTransactions).forEach((transaction) => {
      if (!transaction.categoryId) return;
      if (categoryIds.has(transaction.categoryId)) {
        transaction.categoryId = inheritingCategoryId as CategoryId;
      }
    });
  }

  //-----
  // remove months
  //-----
  for (const { id } of monthsToDelete) {
    delete updatedMonths[id];
  }

  //-----
  // update rta
  //-----
  if (rtaMonthId) {
    updatedMonths[rtaMonthId].available += assignedTotal;
  }

  return {
    deleted: {
      categoryGroup: categoryGroup,
      categories: categoriesToDelete,
      months: monthsToDelete,
    },
    updated: {
      categories: updatedCategories,
      transactions: updatedTransactions,
      months: updatedMonths as Record<string, MonthBranded>,
    },
  };
}
