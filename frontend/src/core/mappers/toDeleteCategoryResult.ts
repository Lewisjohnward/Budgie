import {
  asMonthId,
  asCategoryId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";
import { DeleteCategoryResult } from "../api/budget/category/categoryApiSlice";
import { DeleteCategoryResponse } from "../types/exported-types";
import { toCategory, toMonth, toTransaction } from "./entityMapper";

export const toDeleteCategoryResult = (
  raw: DeleteCategoryResponse
): DeleteCategoryResult => ({
  deleted: {
    category: toCategory(raw.deleted.category),

    months: Object.fromEntries(
      Object.entries(raw.deleted.months).map(([id, month]) => [
        asMonthId(id),
        toMonth(month),
      ])
    ),
  },

  updated: {
    categories: Object.fromEntries(
      Object.entries(raw.updated.categories).map(([id, category]) => [
        asCategoryId(id),
        toCategory(category),
      ])
    ),

    months: Object.fromEntries(
      Object.entries(raw.updated.months).map(([id, month]) => [
        asMonthId(id),
        toMonth(month),
      ])
    ),

    transactions: Object.fromEntries(
      Object.entries(raw.updated.transactions).map(([id, transaction]) => [
        asTransactionId(id),
        toTransaction(transaction),
      ])
    ),
  },
});
