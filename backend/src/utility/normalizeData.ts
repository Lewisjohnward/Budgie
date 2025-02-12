type Account = {
  id: string;
  userId: string;
  name: string;
  type: "BANK" | "CREDIT_CARD";
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  transactions: Transaction[];
};

type Transaction = {
  id: string;
  accountId: string;
  categoryId: string;
  date: Date;
  inflow: number | null;
  outflow: number | null;
  payee: string | null;
  memo: string | null;
  cleared: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
};

type Category = {
  id: string;
  userId: string;
  // type: "EXPENSE" | "INCOME";
  name: string;
};

type NormalizedData = {
  accounts: { [key: string]: Account };
  transactions: { [key: string]: Transaction };
  categories: { [key: string]: Category };
};

export function normalizeData(data: { accounts: Account[] }): NormalizedData {
  const normalizedData: NormalizedData = {
    accounts: {},
    transactions: {},
    categories: {},
  };

  data.accounts.forEach((account) => {
    normalizedData.accounts[account.id] = {
      id: account.id,
      userId: account.userId,
      name: account.name,
      type: account.type,
      balance: account.balance,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      transactions: [],
    };

    account.transactions.forEach((transaction) => {
      normalizedData.transactions[transaction.id] = {
        ...transaction,
      };

      if (!normalizedData.categories[transaction.categoryId]) {
        normalizedData.categories[transaction.categoryId] = {
          id: transaction.categoryId,
          userId: transaction.category.userId,
          // type: "EXPENSE",
          name: transaction.category.name,
        };
      }
    });
  });

  return normalizedData;
}

type CategoryGroup = {
  id: string;
  name: string;
  categories: CategoryT[];
};

type CategoryT = {
  id: string;
  userId: string;
  categoryGroupId: string;
  // type: "EXPENSE" | "INCOME";
  name: string;
  assigned: number;
  activity: number;
};

// TODO: FIX TYPING
export function normalizeCategories(categoryGroups: CategoryGroup[]) {
  console.log(categoryGroups);
  const normalizedData = categoryGroups.reduce(
    (acc, categoryGroup) => {
      // @ts-ignore
      acc.categoryGroups[categoryGroup.id] = {
        id: categoryGroup.id,
        name: categoryGroup.name,

        // @ts-ignore
        categories: categoryGroup.categories.map((cat) => cat.id),
      };

      categoryGroup.categories.forEach((cat) => {
        // @ts-ignore
        acc.categories[cat.id] = {
          id: cat.id,
          userId: cat.userId,
          categoryId: cat.categoryGroupId,
          name: cat.name,
          assigned: cat.assigned,
          activity: cat.activity,
        };
      });

      return acc;
    },
    { categoryGroups: {}, categories: {} },
  );
  return normalizedData;
}
