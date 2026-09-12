import { BudgetSnapshot } from "@/core/types/NormalizedData";
import { apiSlice } from "../apiSlice";
import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  asAccountId,
  asCategoryGroupId,
  asCategoryId,
  asMonthId,
  asMonthKey,
  asNoteId,
  asPayeeId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";
import { mapTransaction } from "./mappers/transactionMapper";

export const budgetSnapshotSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBudgetSnapshot: builder.query<BudgetSnapshot, void>({
      query: () => {
        return {
          url: "budget/snapshot",
          method: "GET",
        };
      },
      transformResponse: toBudgetSnapshot,
      providesTags: ["Bootstrap"],
    }),
  }),
});

export const { useGetBudgetSnapshotQuery } = budgetSnapshotSlice;

/**
 * Converts raw bootstrap API response into a strongly-typed application-ready data structure.
 *
 * This function performs two main responsibilities:
 *
 * 1. **Key branding / typing safety**
 *    - Casts string-based IDs (e.g. categoryId, monthId, accountId) into branded types
 *    - Ensures downstream code cannot accidentally mix unrelated ID domains
 *
 * 2. **Structural normalization**
 *    - Preserves backend shape but enforces consistent Record<Id, Entity> mappings
 *    - Guarantees that all entity collections are keyed by their respective branded IDs
 *
 * ⚠️ Important:
 * - This function assumes the backend data is already structurally valid.
 * - It does NOT perform runtime validation (no Zod / schema checks).
 * - It is intended to be a *trusted boundary transformer*, not a sanitizer.
 *
 * @param raw - Raw bootstrap payload returned from the API
 * @returns Fully typed and branded application bootstrap state
 */

export function toBudgetSnapshot(raw: ApiBudgetSnapshot): BudgetSnapshot {
  return {
    categoryGroups: {
      user: Object.fromEntries(
        Object.entries(raw.categoryGroups.user).map(([id, g]) => [
          asCategoryGroupId(id),
          {
            id: asCategoryGroupId(id),
            name: g.name,
            position: g.position,
          },
        ])
      ),

      inflow: {
        id: asCategoryGroupId(raw.categoryGroups.inflow.id),
        name: raw.categoryGroups.inflow.name,
      },

      uncategorised: {
        id: asCategoryGroupId(raw.categoryGroups.uncategorised.id),
        name: raw.categoryGroups.uncategorised.name,
      },
    },

    categories: {
      user: Object.fromEntries(
        Object.entries(raw.categories.user).map(([id, c]) => [
          asCategoryId(id),
          {
            id: asCategoryId(id),
            name: c.name,
            position: c.position,
            categoryGroupId: asCategoryGroupId(c.categoryGroupId),
          },
        ])
      ),

      rta: {
        id: asCategoryId(raw.categories.rta.id),
        name: raw.categories.rta.name,
        categoryGroupId: asCategoryGroupId(raw.categories.rta.categoryGroupId),
      },

      uncategorised: {
        id: asCategoryId(raw.categories.uncategorised.id),
        name: raw.categories.uncategorised.name,
        categoryGroupId: asCategoryGroupId(
          raw.categories.uncategorised.categoryGroupId
        ),
      },
    },

    months: Object.fromEntries(
      Object.entries(raw.months).map(([id, m]) => [
        asMonthId(id),
        {
          id: asMonthId(id),
          categoryId: asCategoryId(m.categoryId),
          month: asMonthKey(m.month),
          activity: m.activity,
          assigned: m.assigned,
          available: m.available,
        },
      ])
    ),

    accounts: Object.fromEntries(
      Object.entries(raw.accounts).map(([id, a]) => [
        asAccountId(id),
        {
          id: asAccountId(id),
          name: a.name,
          position: a.position,
          open: a.open,
          type: a.type,
          deletable: a.deletable,
          balance: a.balance,
        },
      ])
    ),

    transactions: Object.fromEntries(
      Object.entries(raw.transactions).map(([id, t]) => [
        asTransactionId(id),
        mapTransaction(t),
      ])
    ),

    payees: Object.fromEntries(
      Object.entries(raw.payees).map(([id, p]) => [
        asPayeeId(id),
        {
          id: asPayeeId(id),
          name: p.name,
          origin: p.origin,
          defaultCategoryId: p.defaultCategoryId
            ? asCategoryId(p.defaultCategoryId)
            : null,
          includeInPayeeList: p.includeInPayeeList,
          automaticallyCategorisePayee: p.automaticallyCategorisePayee,
        },
      ])
    ),

    notesByMonth: Object.fromEntries(
      Object.entries(raw.memosByMonth).map(([month, m]) => [
        asMonthKey(month),
        {
          id: asNoteId(m.id),
          month: asMonthKey(m.month),
          content: m.content,
        },
      ])
    ),

    monthKeys: raw.monthKeys.map(asMonthKey),
  };
}
