import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  categoryIds,
  categoryGroupIds,
  monthIds,
  memoIds,
  accountIds,
  transactionIds,
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
import { createAccount } from "../../utils/entities/createAccount";
import { createMemo } from "../../utils/entities/createMemo";
import { createNormalTransaction } from "../../utils/entities/createTransaction";

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
  accounts: {},
  transactions: {},
  payees: {},
  memosByMonth: {
    [monthKey]: createMemo(memoIds.memoM1),
  },
};

export const withAssignedSnapshot = createSnapshot({
  months: {
    ...baseSnapshot.months,
    [monthIds.rtaM1]: {
      ...baseSnapshot.months[monthIds.rtaM1],
      available: 200,
    },
    [monthIds.groceriesM1]: {
      ...baseSnapshot.months[monthIds.groceriesM1],
      assigned: 500,
    },
  },
});

export const withTransactionSnapshot = createSnapshot({
  categoryGroups: {
    ...baseSnapshot.categoryGroups,
    user: {
      ...baseSnapshot.categoryGroups.user,
      [categoryGroupIds.other]: createUserCategoryGroup(
        categoryGroupIds.other,
        {
          name: "Other",
        }
      ),
    },
  },

  categories: {
    ...baseSnapshot.categories,
    user: {
      ...baseSnapshot.categories.user,
      [categoryIds.rent]: createUserCategory(
        categoryIds.rent,
        categoryGroupIds.other,
        {
          name: "Rent",
        }
      ),
    },
  },

  months: {
    ...baseSnapshot.months,
    [monthIds.rtaM1]: {
      ...baseSnapshot.months[monthIds.rtaM1],
      available: 200,
    },
    [monthIds.groceriesM1]: {
      ...baseSnapshot.months[monthIds.groceriesM1],
      assigned: 10,
      activity: -25,
      available: -25,
    },
    [monthIds.rentM1]: createMonth(monthIds.rentM1, categoryIds.rent),
  },

  accounts: {
    [accountIds.checking]: createAccount(accountIds.checking, {
      balance: -25,
    }),
  },

  transactions: {
    [transactionIds.groceries]: createNormalTransaction({
      id: transactionIds.groceries,
      accountId: accountIds.checking,
      categoryId: categoryIds.groceries,
      outflow: 20,
    }),
    [transactionIds.groceries2]: createNormalTransaction({
      id: transactionIds.groceries2,
      accountId: accountIds.checking,
      categoryId: categoryIds.groceries,
      outflow: 5,
    }),
  },
});
