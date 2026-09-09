import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import {
  categoryIds,
  categoryGroupIds,
  monthIds,
  memoIds,
} from "../fixtures/ids";
import { createMonth } from "../utils/createMonth";
import { createSystemCategory } from "../utils/entities/createCategory";
import { createSystemCategoryGroup } from "../utils/entities/createCategoryGroup";
import { createMemo } from "../utils/entities/createMemo";

const defaultMonth = "2026-07";
const monthKey1 = defaultMonth;
const monthKey2 = "2026-08";
export const INITIAL_TEST_MEMO_CONTENT_1 = "Edit memo test month 0";
export const INITIAL_TEST_MEMO_CONTENT_2 = "Edit memo test month 1";

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
    [monthIds.rtaM2]: createMonth(monthIds.rtaM2, categoryIds.rta, {
      month: monthKey2,
    }),
    [monthIds.uncategorisedM1]: createMonth(
      monthIds.uncategorisedM1,
      categoryIds.uncategorised
    ),
    [monthIds.uncategorisedM2]: createMonth(
      monthIds.uncategorisedM2,
      categoryIds.uncategorised,
      { month: monthKey2 }
    ),
  },
  monthKeys: [monthKey1, monthKey2],
  accounts: {},
  transactions: {},
  payees: {},
  memosByMonth: {
    [monthKey1]: createMemo(memoIds.memoM1, {
      content: INITIAL_TEST_MEMO_CONTENT_1,
    }),
    [monthKey2]: createMemo(memoIds.memoM2, {
      content: INITIAL_TEST_MEMO_CONTENT_2,
    }),
  },
};
