import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  createUserCategory,
  createSystemCategory,
} from "../../utils/createCategory";
import {
  createUserCategoryGroup,
  createSystemCategoryGroup,
} from "../../utils/createCategoryGroup";
import { createMemo } from "../../utils/createMemo";
import { createMonth } from "../../utils/createMonth";

const defaultMonth = "2026-07";

const inflowCategoryGroupId = "rta_cat_group_id";
const uncategoriesCategoryGroupId = "uncat_cat_group_id";
const importantCategoryGroupId = "important_cat_group_id";
const otherCategoryGroupId = "other_cat_group_id";

const groceriesCategoryId = "cat_groceries";
const rentCategoryId = "cat_rent";
export const rtaCategoryIdTest = "cat_rta";
const uncatCategoryId = "cat_uncat";

const rta_month_1 = "rta_month_1";
const uncat_month_1 = "uncat_month_1";
const groceries_month_1 = "groceries_month_1";
const rent_month_1 = "rent_month_1";

const memo1 = "memo_1";

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
      [groceriesCategoryId]: createUserCategory(
        groceriesCategoryId,
        importantCategoryGroupId,
        {
          name: "Groceries",
        }
      ),
      [rentCategoryId]: createUserCategory(
        rentCategoryId,
        importantCategoryGroupId,
        {
          name: "Rent",
        }
      ),
    },
    rta: createSystemCategory(rtaCategoryIdTest, inflowCategoryGroupId),
    uncategorised: createSystemCategory(
      uncatCategoryId,
      uncategoriesCategoryGroupId
    ),
  },

  categoryGroups: {
    user: {
      [importantCategoryGroupId]: createUserCategoryGroup(
        importantCategoryGroupId,
        { name: "Important" }
      ),
      [otherCategoryGroupId]: createUserCategoryGroup(otherCategoryGroupId, {
        name: "Other",
      }),
    },
    inflow: createSystemCategoryGroup(inflowCategoryGroupId),
    uncategorised: createSystemCategoryGroup(uncategoriesCategoryGroupId),
  },

  months: {
    [rta_month_1]: createMonth(rta_month_1, rtaCategoryIdTest),
    [uncat_month_1]: createMonth(uncat_month_1, uncatCategoryId),
    [groceries_month_1]: createMonth(groceries_month_1, groceriesCategoryId),
    [rent_month_1]: createMonth(rent_month_1, rentCategoryId),
  },

  monthKeys: [monthKey],
  accounts: {},
  transactions: {},
  payees: {},
  memosByMonth: {
    [monthKey]: createMemo(memo1),
  },
};
