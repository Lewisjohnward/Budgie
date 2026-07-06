import { createBudgetSnapshot } from "./createBudgetSnapshot";

export const scenarios = {
  simpleCategory: createBudgetSnapshot({
    categories: {
      user: {
        cat_1: {
          id: "cat_1",
          name: "Groceries",
          // ...
        },
      },
    },
  }),

  categoryWithTransactions: createBudgetSnapshot({
    transactions: {
      tx_1: {
        id: "tx_1",
        categoryId: "cat_1",
      },
    },
  }),
};
