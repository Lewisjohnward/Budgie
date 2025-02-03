import { Decimal } from "@prisma/client/runtime/library";

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
  subCategoryId: string;
  date: Date;
  inflow: number | null;
  outflow: number | null;
  payee: string | null;
  memo: string | null;
  cleared: boolean;
  createdAt: Date;
  updatedAt: Date;
  subCategory: SubCategory;
};

type SubCategory = {
  id: string;
  userId: string;
  // type: "EXPENSE" | "INCOME";
  name: string;
};

type NormalizedData = {
  accounts: { [key: string]: Account };
  transactions: { [key: string]: Transaction };
  subCategories: { [key: string]: SubCategory };
};

export function normalizeData(data: { accounts: Account[] }): NormalizedData {
  const normalizedData: NormalizedData = {
    accounts: {},
    transactions: {},
    subCategories: {},
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

      if (!normalizedData.subCategories[transaction.subCategoryId]) {
        normalizedData.subCategories[transaction.subCategoryId] = {
          id: transaction.subCategoryId,
          userId: transaction.subCategory.userId,
          // type: "EXPENSE",
          name: transaction.subCategory.name,
        };
      }
    });
  });

  return normalizedData;
}
