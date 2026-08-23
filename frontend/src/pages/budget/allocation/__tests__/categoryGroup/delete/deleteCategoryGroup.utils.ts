import {
  type DeleteCategoryGroupResponse,
  type ApiBudgetSnapshot,
  type ApiCategoryUser,
  type ApiMonth,
  type ApiTransactionNormal,
} from "@/core/types/exported-types";
import { type MonthBranded } from "@/core/types/NormalizedData";
import { categoryIds } from "../../fixtures/ids";

export function calculateDeleteCategoryGroupResult(
  snapshot: ApiBudgetSnapshot,
  categoryGroupId: string,
  inheritingCategoryId?: string
): DeleteCategoryGroupResponse {
  // get category group
  const categoryGroup = snapshot.categoryGroups.user[categoryGroupId];

  // get categories belonging to group
  const categoriesToDelete = Object.values(snapshot.categories.user).filter(
    (c) => c.categoryGroupId === categoryGroup.id
  );

  const categoriesToDeleteMap = Object.fromEntries(
    categoriesToDelete.map((category) => [category.id, category])
  );

  // group months by category ID
  const monthsByCategoryId = Object.values(snapshot.months).reduce(
    (acc, month) => {
      if (!acc[month.categoryId]) {
        acc[month.categoryId] = [];
      }

      acc[month.categoryId].push(month as MonthBranded);

      return acc;
    },
    {} as Record<string, ApiMonth[]>
  );

  // get months to delete
  const monthsToDelete = categoriesToDelete.flatMap(
    (category) => monthsByCategoryId[category.id] ?? []
  );

  const monthsToDeleteMap = Object.fromEntries(
    monthsToDelete.map((month) => [month.id, month])
  );

  const updatedCategoryGroups = Object.values(snapshot.categoryGroups.user)
    .filter((cg) => cg.id !== categoryGroupId)
    .map((cg) => ({
      id: cg.id,
      position: cg.position,
    }));

  // clone user categories
  const updatedCategories = { ...snapshot.categories.user } as Record<
    string,
    ApiCategoryUser
  >;

  // delete categories
  for (const category of categoriesToDelete) {
    delete updatedCategories[category.id];
  }

  // calculate total assigned for deleted months
  const assignedTotal = monthsToDelete.reduce((sum, m) => sum + m.assigned, 0);

  // get rtaMonthId
  const rtaMonthId = Object.keys(snapshot.months).find(
    (id) => snapshot.months[id].categoryId === categoryIds.rta
  );

  const updatedMonths = structuredClone(snapshot.months);

  const categoryIdsToDelete = new Set(
    categoriesToDelete.map((category) => category.id)
  );

  const updatedTransactionsMap = Object.values(
    structuredClone(snapshot.transactions)
  ).reduce(
    (acc, transaction) => {
      if (transaction.type !== "normal") return acc;

      if (
        inheritingCategoryId &&
        categoryIdsToDelete.has(transaction.categoryId)
      ) {
        transaction.categoryId = inheritingCategoryId;
      }

      acc[transaction.id] = transaction;

      return acc;
    },
    {} as Record<string, ApiTransactionNormal>
  );

  // transfer deleted month values to inheriting category
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
  }

  // remove months
  for (const { id } of monthsToDelete) {
    delete updatedMonths[id];
  }

  // update rta
  if (rtaMonthId) {
    updatedMonths[rtaMonthId].available += assignedTotal;
  }

  return {
    deleted: {
      categoryGroup: categoryGroup,
      categories: categoriesToDeleteMap,
      months: monthsToDeleteMap,
    },
    updated: {
      categoryGroups: updatedCategoryGroups,
      transactions: updatedTransactionsMap,
      months: updatedMonths as Record<string, MonthBranded>,
    },
  };
}
