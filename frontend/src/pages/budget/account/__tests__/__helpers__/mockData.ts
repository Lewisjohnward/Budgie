import { NormalizedData } from "@/core/types/NormalizedData";
import { AllocationData } from "@/core/types/Allocation";
import { createManyTransactions } from "./factories";

// Generate current and previous month dates dynamically
const now = new Date();
const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

// Mock data for useGetAccountsQuery (returns NormalizedData)
export const baseMockAccountData: NormalizedData = {
  accounts: {
    acc1: {
      id: "acc1",
      userId: "user1",
      name: "Checking Account",
      type: "BANK",
      balance: 1000,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
      transactions: ["tx1", "tx2", "tx3"],
    },
  },
  transactions: {
    tx1: {
      id: "tx1",
      accountId: "acc1",
      categoryId: "cat1",
      date: new Date("2025-10-31T00:00:00.000Z"),
      inflow: 0,
      outflow: 50,
      payee: "Grocery Store",
      memo: "tx1",
      cleared: false,
      createdAt: new Date("2025-10-31T00:00:00.000Z"),
      updatedAt: new Date("2025-10-31T00:00:00.000Z"),
      category: "Food: Groceries",
    },
    tx2: {
      id: "tx2",
      accountId: "acc1",
      categoryId: "cat2",
      date: new Date("2025-10-30T00:00:00.000Z"),
      inflow: 1000,
      outflow: 0,
      payee: "Employer",
      memo: "tx2",
      cleared: false,
      createdAt: new Date("2025-10-30T00:00:00.000Z"),
      updatedAt: new Date("2025-10-30T00:00:00.000Z"),
      category: "Inflow: Salary",
    },
    tx3: {
      id: "tx3",
      accountId: "acc1",
      categoryId: "cat2",
      date: new Date("2025-10-30T00:00:00.000Z"),
      inflow: 0,
      outflow: 100,
      payee: "Employer",
      memo: "tx3",
      cleared: false,
      createdAt: new Date("2025-10-30T00:00:00.000Z"),
      updatedAt: new Date("2025-10-30T00:00:00.000Z"),
      category: "Inflow: Salary",
    },
  },
  categories: {
    cat1: {
      id: "cat1",
      userId: "user1",
      categoryGroupId: "cg1",
      name: "Groceries",
      months: ["m1"],
      position: 0,
    },
    cat2: {
      id: "cat2",
      userId: "user1",
      categoryGroupId: "cg2",
      name: "Salary",
      months: ["m2"],
      position: 0,
    },
  },
  categoryGroups: {
    cg1: {
      id: "cg1",
      name: "Food",
      categories: ["cat1"],
    },
    cg2: {
      id: "cg2",
      name: "Inflow",
      categories: ["cat2"],
    },
  },
};

// Mock data for useGetCategoriesQuery (returns AllocationData)
export const baseMockCategoryData: AllocationData = {
  categories: {
    cat1: {
      id: "cat1",
      userId: "user1",
      name: "Groceries",
      categoryGroupId: "cg1",
      position: 0,
      months: ["m1", "m2"],
      transactions: ["tx1"],
    },
    cat2: {
      id: "cat2",
      userId: "user1",
      name: "Salary",
      categoryGroupId: "cg2",
      position: 0,
      months: ["m3", "m4"],
      transactions: ["tx2"],
    },
  },
  categoryGroups: {
    cg1: {
      id: "cg1",
      name: "Food",
      categories: ["cat1"],
    },
    cg2: {
      id: "cg2",
      name: "Inflow",
      categories: ["cat2"],
    },
  },
  months: {
    m1: {
      id: "m1",
      month: previousMonth.toISOString(),
      assigned: 200,
      activity: -50,
      available: 150,
      categoryId: "cat1",
    },
    m2: {
      id: "m2",
      month: currentMonth.toISOString(),
      assigned: 200,
      activity: -50,
      available: 150,
      categoryId: "cat1",
    },
    m3: {
      id: "m3",
      month: previousMonth.toISOString(),
      assigned: 0,
      activity: 1000,
      available: 1000,
      categoryId: "cat2",
    },
    m4: {
      id: "m4",
      month: currentMonth.toISOString(),
      assigned: 0,
      activity: 1000,
      available: 1000,
      categoryId: "cat2",
    },
  },
};

export const emptyAccountData: NormalizedData = {
  ...baseMockAccountData,
  accounts: {
    acc1: {
      ...baseMockAccountData.accounts.acc1,
      transactions: [],
    },
  },
  transactions: {},
};

// Mock data with many transactions for volume/scrolling tests
const manyTransactions = createManyTransactions(200);
const manyTransactionIds = manyTransactions.map((t) => t.id);
const manyTransactionsById = Object.fromEntries(
  manyTransactions.map((t) => [t.id, t])
);

export const manyTransactionsAccountData: NormalizedData = {
  ...baseMockAccountData,
  accounts: {
    acc1: {
      ...baseMockAccountData.accounts.acc1,
      transactions: manyTransactionIds,
    },
  },
  transactions: manyTransactionsById,
};
