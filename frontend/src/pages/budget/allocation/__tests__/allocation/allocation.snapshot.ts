import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  categoryIds,
  categoryGroupIds,
  monthIds,
  memoIds,
  accountIds,
  transactionIds,
} from "../fixtures/ids";
import { createMonth } from "../utils/createMonth";
import {
  createUserCategory,
  createSystemCategory,
} from "../utils/entities/createCategory";
import {
  createUserCategoryGroup,
  createSystemCategoryGroup,
} from "../utils/entities/createCategoryGroup";
import { createMemo } from "../utils/entities/createMemo";
import { createNormalTransaction } from "../utils/entities/createTransaction";
import { createAccount } from "../utils/entities/createAccount";

const monthKey1 = "2026-07";
const monthKey2 = "2026-08";

export const snapshot: ApiBudgetSnapshot = {
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
      categoryGroupIds.uncategorised,
      { name: "Uncategorised" }
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
    [monthIds.rtaM1]: createMonth(monthIds.rtaM1, categoryIds.rta, {
      month: monthKey1,
    }),
    [monthIds.rtaM2]: createMonth(monthIds.rtaM2, categoryIds.rta, {
      month: monthKey2,
    }),
    [monthIds.uncategorisedM1]: createMonth(
      monthIds.uncategorisedM1,
      categoryIds.uncategorised,
      {
        month: monthKey1,
      }
    ),
    [monthIds.uncategorisedM2]: createMonth(
      monthIds.uncategorisedM2,
      categoryIds.uncategorised,
      {
        month: monthKey2,
      }
    ),
    [monthIds.groceriesM1]: createMonth(
      monthIds.groceriesM1,
      categoryIds.groceries,
      {
        month: monthKey1,
      }
    ),
    [monthIds.groceriesM2]: createMonth(
      monthIds.groceriesM2,
      categoryIds.groceries,
      {
        month: monthKey2,
      }
    ),
    [monthIds.rentM1]: createMonth(monthIds.rentM1, categoryIds.rent, {
      month: monthKey1,
    }),
    [monthIds.rentM2]: createMonth(monthIds.rentM2, categoryIds.rent, {
      month: monthKey2,
    }),
  },

  monthKeys: [monthKey1, monthKey2],
  accounts: {
    [accountIds.checking]: createAccount(accountIds.checking, { balance: -10 }),
  },
  transactions: {
    [transactionIds.groceries]: createNormalTransaction({
      id: transactionIds.groceries,
      accountId: accountIds.checking,
      categoryId: categoryIds.uncategorised,
      outflow: 10,
    }),
  },
  payees: {},
  memosByMonth: {
    [monthKey1]: createMemo(memoIds.memo),
    [monthKey2]: createMemo(memoIds.memo),
  },
};
