import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  categoryIds,
  categoryGroupIds,
  monthIds,
  memoIds,
} from "../../fixtures/ids";
import {
  createUserCategory,
  createSystemCategory,
} from "../../utils/entities/createCategory";
import {
  createUserCategoryGroup,
  createSystemCategoryGroup,
} from "../../utils/entities/createCategoryGroup";
import { createMonth } from "../../utils/createMonth";
import { createMemo } from "../../utils/entities/createMemo";

const defaultMonth = "2026-07";
const monthKey = defaultMonth;

export function createSnapshot(overrides?: Partial<ApiBudgetSnapshot>) {
  return structuredClone({
    ...baseSnapshot,
    ...overrides,
  });
}
export const baseSnapshot: ApiBudgetSnapshot = {
  categories: {
    user: {
      [categoryIds.groceries]: createUserCategory(
        categoryIds.groceries,
        categoryGroupIds.important,
        {
          name: "Groceries",
        }
      ),
      [categoryIds.rent]: createUserCategory(
        categoryIds.rent,
        categoryGroupIds.important,
        {
          name: "Rent",
        }
      ),
    },
    rta: createSystemCategory(categoryIds.rta, categoryGroupIds.inflow),
    uncategorised: createSystemCategory(
      categoryIds.uncategorised,
      categoryGroupIds.uncategorised
    ),
  },

  categoryGroups: {
    user: {
      [categoryGroupIds.important]: createUserCategoryGroup(
        categoryGroupIds.important,
        { name: "Important" }
      ),
      [categoryGroupIds.other]: createUserCategoryGroup(
        categoryGroupIds.other,
        {
          name: "Other",
        }
      ),
    },
    inflow: createSystemCategoryGroup(categoryGroupIds.inflow),
    uncategorised: createSystemCategoryGroup(categoryGroupIds.uncategorised),
  },

  months: {
    [monthIds.rta]: createMonth(monthIds.rta, categoryIds.rta),
    [monthIds.uncategorised]: createMonth(
      monthIds.uncategorised,
      categoryIds.uncategorised
    ),
    [monthIds.groceries]: createMonth(
      monthIds.groceries,
      categoryIds.groceries
    ),
    [monthIds.rent]: createMonth(monthIds.rent, categoryIds.rent),
  },

  monthKeys: [monthKey],
  accounts: {},
  transactions: {},
  payees: {},
  memosByMonth: {
    [monthKey]: createMemo(memoIds.memo),
  },
};
