import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  categoryIds,
  categoryGroupIds,
  monthIds,
  memoIds,
  accountIds,
  transactionIds,
} from "../../fixtures/ids";
import { createMonth } from "../../utils/createMonth";
import { createAccount } from "../../utils/entities/createAccount";
import {
  createUserCategory,
  createSystemCategory,
} from "../../utils/entities/createCategory";
import {
  createUserCategoryGroup,
  createSystemCategoryGroup,
} from "../../utils/entities/createCategoryGroup";
import { createMemo } from "../../utils/entities/createMemo";
import { createNormalTransaction } from "../../utils/entities/createTransaction";
import { defaultMonth } from "../../utils/entities/defaults";

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
    [monthIds.rta]: createMonth(monthIds.rta, categoryIds.rta),
    [monthIds.uncategorised]: createMonth(
      monthIds.uncategorised,
      categoryIds.uncategorised
    ),
    [monthIds.groceries]: createMonth(
      monthIds.groceries,
      categoryIds.groceries
    ),
  },

  monthKeys: [monthKey],
  accounts: {},
  transactions: {},
  payees: {},
  memosByMonth: {
    [monthKey]: createMemo(memoIds.memo),
  },
};

export const withAssignedSnapshot = createSnapshot({
  months: {
    ...baseSnapshot.months,
    [monthIds.rta]: {
      ...baseSnapshot.months[monthIds.rta],
      available: 200,
    },
    [monthIds.groceries]: {
      ...baseSnapshot.months[monthIds.groceries],
      assigned: 500,
    },
  },
});

export const withTransactionSnapshot = createSnapshot({
  categories: {
    ...baseSnapshot.categories,
    user: {
      ...baseSnapshot.categories.user,
      [categoryIds.rent]: createUserCategory(
        categoryIds.rent,
        categoryGroupIds.important,
        {
          name: "Rent",
        }
      ),
    },
  },
  months: {
    ...baseSnapshot.months,
    [monthIds.rta]: {
      ...baseSnapshot.months[monthIds.rta],
      available: 200,
    },
    [monthIds.groceries]: {
      ...baseSnapshot.months[monthIds.groceries],
      assigned: 10,
      activity: -20,
      available: -10,
    },
    [monthIds.rent]: createMonth(monthIds.rent, categoryIds.groceries),
  },
  accounts: {
    ...baseSnapshot.accounts,
    [accountIds.checking]: createAccount(accountIds.checking, { balance: -10 }),
  },
  transactions: {
    ...baseSnapshot.transactions,
    [transactionIds.groceries]: createNormalTransaction({
      id: transactionIds.groceries,
      accountId: accountIds.checking,
      categoryId: categoryIds.groceries,
      outflow: 10,
    }),
  },
});
