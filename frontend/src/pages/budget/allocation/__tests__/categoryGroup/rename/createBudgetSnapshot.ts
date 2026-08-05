import {
  CategoryBranded,
  CategoryGroupBranded,
} from "@/core/types/NormalizedData";
import {
  ApiAccount,
  ApiBudgetSnapshot,
  ApiCategory,
  ApiMemo,
  ApiMonth,
  ApiTransaction,
} from "@/core/types/exported-types";

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

const acc1 = "acc_1";
const tx1 = "tx_1";
const tx2 = "tx_2";
const monthKey = defaultMonth;

export const baseSnapshot: ApiBudgetSnapshot = {
  categories: {
    user: {
      [groceriesCategoryId]: createCategory(
        groceriesCategoryId,
        importantCategoryGroupId,
        {
          name: "Groceries",
        }
      ),
      [rentCategoryId]: createCategory(
        rentCategoryId,
        importantCategoryGroupId,
        {
          name: "Rent",
        }
      ),
    },
    rta: createCategory(rtaCategoryIdTest, inflowCategoryGroupId),
    uncategorised: createCategory(uncatCategoryId, uncategoriesCategoryGroupId),
  },

  categoryGroups: {
    user: {
      [importantCategoryGroupId]: createCategoryGroup(
        importantCategoryGroupId,
        { name: "Important" }
      ),
    },
    inflow: createCategoryGroup(inflowCategoryGroupId),
    uncategorised: createCategoryGroup(uncategoriesCategoryGroupId),
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

export function createSnapshot(overrides?: Partial<ApiBudgetSnapshot>) {
  return structuredClone({
    ...baseSnapshot,
    ...overrides,
  });
}

function createCategoryGroup(
  id: string,
  overrides?: Partial<CategoryGroupBranded>
): ApiBudgetSnapshot["categoryGroups"]["inflow"] {
  return {
    id,
    name: "default",
    position: 0,
    ...overrides,
  };
}

function createCategory(
  id: string,
  categoryGroupId: string,
  overrides?: Partial<CategoryBranded>
): ApiCategory {
  return {
    id,
    name: "default",
    categoryGroupId,
    position: 0,
    ...overrides,
  };
}

function createMemo(id: string, overrides?: Partial<ApiMemo>): ApiMemo {
  return {
    id,
    month: defaultMonth,
    content: "Holiday budget",
    ...overrides,
  };
}

function createMonth(
  id: string,
  categoryId: string,
  overrides?: Partial<ApiMonth>
): ApiMonth {
  return {
    id,
    categoryId,
    month: defaultMonth,
    activity: 0,
    available: 0,
    assigned: 0,
    ...overrides,
  };
}

function createAccount(
  id: string,
  overrides?: Partial<ApiAccount>
): ApiAccount {
  return {
    id,
    name: "default",
    position: 0,
    open: true,
    type: "BANK",
    deletable: false,
    balance: 0,
    ...overrides,
  };
}

type CreateTransactionOverrides = Partial<ApiTransaction> & {
  id: string;
  accountId: string;
  categoryId: string | null;
};

export function createTransaction({
  id,
  accountId,
  categoryId,
  date = new Date(`${defaultMonth}-01`).toISOString(),
  inflow = 0,
  outflow = 10,
  payeeId = null,
  memo = "",
}: CreateTransactionOverrides): ApiTransaction {
  return {
    id,
    accountId,
    categoryId,
    date,
    inflow,
    outflow,
    payeeId,
    memo,
  };
}

export const withAssignedSnapshot = createSnapshot({
  months: {
    ...baseSnapshot.months,
    [rta_month_1]: {
      ...baseSnapshot.months[rta_month_1],
      available: 200,
    },
    [groceries_month_1]: {
      ...baseSnapshot.months[groceries_month_1],
      assigned: 500,
    },
  },
});

export const withTransactionSnapshot = createSnapshot({
  categoryGroups: {
    ...baseSnapshot.categoryGroups,
    user: {
      ...baseSnapshot.categoryGroups.user,
      [otherCategoryGroupId]: createCategoryGroup(otherCategoryGroupId, {
        name: "Other",
      }),
    },
  },
  categories: {
    ...baseSnapshot.categories,
    user: {
      ...baseSnapshot.categories.user,
      [rentCategoryId]: createCategory(rentCategoryId, otherCategoryGroupId, {
        name: "Rent",
      }),
    },
  },
  months: {
    ...baseSnapshot.months,
    [rta_month_1]: {
      ...baseSnapshot.months[rta_month_1],
      available: 200,
    },
    [groceries_month_1]: {
      ...baseSnapshot.months[groceries_month_1],
      assigned: 10,
      activity: -25,
      available: -25,
    },
    [rent_month_1]: createMonth(rent_month_1, rentCategoryId),
  },
  accounts: {
    ...baseSnapshot.accounts,
    [acc1]: createAccount(acc1, { balance: -25 }),
  },
  transactions: {
    ...baseSnapshot.transactions,
    [tx1]: createTransaction({
      id: tx1,
      accountId: acc1,
      categoryId: groceriesCategoryId,
      outflow: 20,
    }),
    [tx2]: createTransaction({
      id: tx2,
      accountId: acc1,
      categoryId: groceriesCategoryId,
      outflow: 5,
    }),
  },
});
