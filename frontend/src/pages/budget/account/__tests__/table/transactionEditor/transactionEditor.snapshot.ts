import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  accountIds,
  categoryGroupIds,
  categoryIds,
  memoIds,
  monthIds,
} from "@/pages/budget/allocation/__tests__/fixtures/ids";
import { createMonth } from "@/pages/budget/allocation/__tests__/utils/createMonth";
import { createAccount } from "@/pages/budget/allocation/__tests__/utils/entities/createAccount";
import { createSystemCategory } from "@/pages/budget/allocation/__tests__/utils/entities/createCategory";
import { createSystemCategoryGroup } from "@/pages/budget/allocation/__tests__/utils/entities/createCategoryGroup";
import { createMemo } from "@/pages/budget/allocation/__tests__/utils/entities/createMemo";
import { defaultMonth } from "@/pages/budget/allocation/__tests__/utils/entities/defaults";

const monthKey = defaultMonth;

export const baseSnapshot: ApiBudgetSnapshot = {
  categories: {
    user: {},
    rta: createSystemCategory(categoryIds.rta, categoryGroupIds.inflow),
    uncategorised: createSystemCategory(
      categoryIds.uncategorised,
      categoryGroupIds.uncategorised
    ),
  },

  categoryGroups: {
    user: {},
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
    [accountIds.checking]: createAccount(accountIds.checking, {
      balance: 0,
      name: "test-account",
    }),
  },
  transactions: {},
  payees: {},
  memosByMonth: {
    [monthKey]: createMemo(memoIds.memoM1),
  },
};
