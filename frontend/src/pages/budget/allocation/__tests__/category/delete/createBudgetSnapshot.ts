import {
  CategorySystemBranded,
  CategoryUserBranded,
} from "@/core/types/NormalizedData";
import {
  ApiAccount,
  ApiBudgetSnapshot,
  ApiCategoryGroupSystem,
  ApiCategoryGroupUser,
  ApiCategorySystem,
  ApiCategoryUser,
  ApiMemo,
  ApiMonth,
  ApiTransaction,
} from "@/core/types/exported-types";

const defaultMonth = "2026-07";

const inflowCategoryGroupId = "rta_cat_group_id";
const uncategoriesCategoryGroupId = "uncat_cat_group_id";
const importantCategoryGroupId = "important_cat_group_id";

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
const monthKey = defaultMonth;

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
    },
    inflow: createSystemCategoryGroup(inflowCategoryGroupId),
    uncategorised: createSystemCategoryGroup(uncategoriesCategoryGroupId),
  },

  months: {
    [rta_month_1]: createMonth(rta_month_1, rtaCategoryIdTest),
    [uncat_month_1]: createMonth(uncat_month_1, uncatCategoryId),
    [groceries_month_1]: createMonth(groceries_month_1, groceriesCategoryId),
  },

  monthKeys: [monthKey],
  accounts: {
    // [acc1]: createAccount(acc1),
  },
  transactions: {
    // [tx1]: createTransaction({
    //   id: tx1,
    //   accountId: acc1,
    //   categoryId: groceriesCategory,
    // }),
  },
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

function createUserCategoryGroup(
  id: string,
  overrides?: Partial<ApiCategoryGroupUser>
): ApiCategoryGroupUser {
  return {
    id,
    name: "default",
    position: 0,
    ...overrides,
  };
}

function createSystemCategoryGroup(
  id: string,
  overrides?: Partial<ApiCategoryGroupSystem>
): ApiCategoryGroupSystem {
  return {
    id,
    name: "default",
    ...overrides,
  };
}

function createUserCategory(
  id: string,
  categoryGroupId: string,
  overrides?: Partial<CategoryUserBranded>
): ApiCategoryUser {
  return {
    id,
    name: "default",
    categoryGroupId,
    position: 0,
    ...overrides,
  };
}

function createSystemCategory(
  id: string,
  categoryGroupId: string,
  overrides?: Partial<CategorySystemBranded>
): ApiCategorySystem {
  return {
    id,
    name: "default",
    categoryGroupId,
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

type CreateNormalTransactionOverrides = Partial<
  Extract<ApiTransaction, { type: "normal" }>
> & {
  id: string;
  accountId: string;
  categoryId: string;
};

export function createNormalTransaction({
  id,
  accountId,
  categoryId,
  date = new Date(`${defaultMonth}-01`).toISOString(),
  inflow = 0,
  outflow = 10,
  payeeId = null,
  memo = "",
}: CreateNormalTransactionOverrides): Extract<
  ApiTransaction,
  { type: "normal" }
> {
  return {
    type: "normal",
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
  categories: {
    ...baseSnapshot.categories,
    user: {
      ...baseSnapshot.categories.user,
      [rentCategoryId]: createUserCategory(
        rentCategoryId,
        importantCategoryGroupId,
        {
          name: "Rent",
        }
      ),
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
      activity: -20,
      available: -10,
    },
    [rent_month_1]: createMonth(rent_month_1, rentCategoryId),
  },
  accounts: {
    ...baseSnapshot.accounts,
    [acc1]: createAccount(acc1, { balance: -10 }),
  },
  transactions: {
    ...baseSnapshot.transactions,
    [tx1]: createNormalTransaction({
      id: tx1,
      accountId: acc1,
      categoryId: groceriesCategoryId,
      outflow: 10,
    }),
  },
});
