import {
  ApiBudgetSnapshot,
  DeleteCategoryResponse,
} from "@/core/types/exported-types";
import { CategoryUserBranded, MonthBranded } from "@/core/types/NormalizedData";
import { categoryIds } from "../../fixtures/ids";

export function deleteCategoryResult(
  snapshot: ApiBudgetSnapshot,
  id: string,
  inheritingCategoryId?: string
): DeleteCategoryResponse {
  const category = snapshot.categories.user[id] as CategoryUserBranded;

  const monthsForCategory = Object.fromEntries(
    Object.entries(snapshot.months).filter(([_, m]) => m.categoryId === id)
  ) as Record<string, MonthBranded>;

  const userCategories = { ...snapshot.categories.user };

  delete userCategories[id];

  const updatedCategories = Object.values(userCategories).map((c) => ({
    id: c.id,
    position: c.position,
    categoryGroupId: c.categoryGroupId,
  }));

  const assignedTotal = Object.values(snapshot.months)
    .filter((m) => m.categoryId === id)
    .reduce((sum, m) => sum + m.assigned, 0);

  const rtaMonthId = Object.keys(snapshot.months).find(
    (id) => snapshot.months[id].categoryId === categoryIds.rta
  );

  const updatedMonths = structuredClone(snapshot.months);

  const updatedTransactions = structuredClone(snapshot.transactions);

  //-----
  // Reassign transactions + month values
  //-----
  if (inheritingCategoryId) {
    const deletedMonth = Object.values(monthsForCategory)[0];

    const inheritingMonth = Object.values(updatedMonths).find(
      (month) => month.categoryId === inheritingCategoryId
    );

    if (deletedMonth && inheritingMonth) {
      inheritingMonth.activity += deletedMonth.activity;
      inheritingMonth.available += deletedMonth.activity;
    }

    Object.values(updatedTransactions).forEach((transaction) => {
      if (transaction.type !== "normal") return;

      if (transaction.categoryId === id) {
        transaction.categoryId = inheritingCategoryId;
      }
    });
  }

  //-----
  // remove deleted categories
  //-----
  for (const monthId of Object.keys(monthsForCategory)) {
    delete updatedMonths[monthId];
  }

  //-----
  // update rta
  //-----
  if (rtaMonthId) {
    updatedMonths[rtaMonthId].available += assignedTotal;
  }

  return {
    deleted: {
      category,
      months: monthsForCategory,
    },
    updated: {
      categories: updatedCategories,
      transactions: updatedTransactions,
      months: updatedMonths as Record<string, MonthBranded>,
    },
  };
}
