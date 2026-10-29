// TODO:(lewis 2026-10-25 12:59) this helper needs to be hoisted
import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  accountIds,
  categoryGroupIds,
  categoryIds,
  memoIds,
  monthIds,
  transactionIds,
} from "@/pages/budget/allocation/__tests__/fixtures/ids";
// TODO:(lewis 2026-10-25 12:59) this helper needs to be hoisted
import { createMonth } from "@/pages/budget/allocation/__tests__/utils/createMonth";
import { createAccount } from "@/pages/budget/allocation/__tests__/utils/entities/createAccount";
// TODO:(lewis 2026-10-25 12:59) this helper needs to be hoisted
import {
  createSystemCategory,
  createUserCategory,
} from "@/pages/budget/allocation/__tests__/utils/entities/createCategory";
// TODO:(lewis 2026-10-25 12:59) this helper needs to be hoisted
import {
  createSystemCategoryGroup,
  createUserCategoryGroup,
} from "@/pages/budget/allocation/__tests__/utils/entities/createCategoryGroup";
// TODO:(lewis 2026-10-25 12:59) this helper needs to be hoisted
import { createMemo } from "@/pages/budget/allocation/__tests__/utils/entities/createMemo";
// TODO:(lewis 2026-10-25 12:59) this helper needs to be hoisted
import { defaultMonth } from "@/pages/budget/allocation/__tests__/utils/entities/defaults";
import { createNormalTransaction } from "@/pages/budget/allocation/__tests__/utils/entities/createTransaction";

const monthKey = defaultMonth;

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
    [accountIds.checking]: createAccount(accountIds.checking, {
      balance: 0,
      name: "test-account",
    }),
  },
  transactions: {
    [transactionIds.groceries]: createNormalTransaction({
      id: transactionIds.groceries,
      accountId: accountIds.checking,
      categoryId: categoryIds.groceries,
      memo: "test transaction 1",
      outflow: 10,
    }),
    [transactionIds.groceries2]: createNormalTransaction({
      id: transactionIds.groceries2,
      accountId: accountIds.checking,
      categoryId: categoryIds.groceries,
      memo: "test transaction 2",
      outflow: 10,
    }),
    [transactionIds.groceries3]: createNormalTransaction({
      id: transactionIds.groceries3,
      accountId: accountIds.checking,
      categoryId: categoryIds.groceries,
      memo: "test transaction 3",
      outflow: 10,
    }),
    [transactionIds.groceries4]: createNormalTransaction({
      id: transactionIds.groceries4,
      accountId: accountIds.checking,
      categoryId: categoryIds.groceries,
      memo: "test transaction 4",
      outflow: 10,
    }),
  },
  payees: {},
  memosByMonth: {
    [monthKey]: createMemo(memoIds.memoM1),
  },
};
