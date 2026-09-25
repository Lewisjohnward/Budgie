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
      [categoryGroupIds.empty]: createUserCategoryGroup(
        categoryGroupIds.empty,
        {
          name: "Empty",
        }
      ),
    },
    inflow: createSystemCategoryGroup(categoryGroupIds.inflow),
    uncategorised: createSystemCategoryGroup(categoryGroupIds.uncategorised),
  },

  months: {
    [monthIds.rtaM1]: createMonth(monthIds.rtaM1, categoryIds.rta, {
      month: "2026-07",
    }),
    [monthIds.uncategorisedM1]: createMonth(
      monthIds.uncategorisedM1,
      categoryIds.uncategorised,
      {
        month: "2026-07",
      }
    ),

    [monthIds.groceriesM1]: createMonth(
      monthIds.groceriesM1,
      categoryIds.groceries,
      { month: "2026-07" }
    ),
    [monthIds.rentM1]: createMonth(monthIds.rentM1, categoryIds.rent, {
      month: "2026-07",
    }),
    [monthIds.rtaM2]: createMonth(monthIds.rtaM2, categoryIds.rta, {
      month: "2026-08",
    }),
    [monthIds.groceriesM2]: createMonth(
      monthIds.groceriesM2,
      categoryIds.groceries,
      { month: "2026-08" }
    ),
    [monthIds.rentM2]: createMonth(monthIds.rentM2, categoryIds.rent, {
      month: "2026-08",
    }),
    [monthIds.uncategorisedM2]: createMonth(
      monthIds.uncategorisedM2,
      categoryIds.uncategorised,
      {
        month: "2026-08",
      }
    ),
  },

  monthKeys: [monthKey, "2026-08"],
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
    [monthKey]: createMemo(memoIds.memoM1),
    ["2026-08"]: createMemo(memoIds.memoM2),
  },
};
