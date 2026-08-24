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

const defaultMonth = "2026-07";
const monthKey = defaultMonth;

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
    [monthIds.rta]: createMonth(monthIds.rta, categoryIds.rta),
    [monthIds.uncategorised]: createMonth(
      monthIds.uncategorised,
      categoryIds.uncategorised,
      {
        activity: -10,
        available: -10,
      }
    ),
    [monthIds.groceries]: createMonth(
      monthIds.groceries,
      categoryIds.groceries
    ),
    [monthIds.rent]: createMonth(monthIds.rent, categoryIds.rent),
  },

  monthKeys: [monthKey],
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
    [monthKey]: createMemo(memoIds.memo),
  },
};
