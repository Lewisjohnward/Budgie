import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  categoryIds,
  categoryGroupIds,
  monthIds,
  memoIds,
  accountIds,
} from "@/pages/budget/allocation/__tests__/fixtures/ids";
import { createMonth } from "@/pages/budget/allocation/__tests__/utils/createMonth";
import { createAccount } from "@/pages/budget/allocation/__tests__/utils/entities/createAccount";
import {
  createUserCategory,
  createSystemCategory,
} from "@/pages/budget/allocation/__tests__/utils/entities/createCategory";
import {
  createUserCategoryGroup,
  createSystemCategoryGroup,
} from "@/pages/budget/allocation/__tests__/utils/entities/createCategoryGroup";
import { createMemo } from "@/pages/budget/allocation/__tests__/utils/entities/createMemo";
import { defaultMonth } from "@/pages/budget/allocation/__tests__/utils/entities/defaults";

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
    },
    inflow: createSystemCategoryGroup(categoryGroupIds.inflow),
    uncategorised: createSystemCategoryGroup(categoryGroupIds.uncategorised),
  },

  months: {
    [monthIds.rtaM1]: createMonth(monthIds.rtaM1, categoryIds.rta),
    [monthIds.uncategorisedM1]: createMonth(
      monthIds.uncategorisedM1,
      categoryIds.uncategorised
    ),
    [monthIds.groceriesM1]: createMonth(
      monthIds.groceriesM1,
      categoryIds.groceries
    ),
  },

  monthKeys: [monthKey],
  accounts: {
    [accountIds.checking]: createAccount(accountIds.checking, { balance: 0 }),
  },
  transactions: {},
  payees: {},
  memosByMonth: {
    [monthKey]: createMemo(memoIds.memoM1),
  },
};
