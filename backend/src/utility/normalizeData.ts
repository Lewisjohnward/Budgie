import { Decimal } from "@prisma/client/runtime/library";

type Account = {
  id: string;
  userId: string;
  name: string;
  type: "BANK" | "CREDIT_CARD";
  balance: Decimal;
  createdAt: Date;
  updatedAt: Date;
  transactions: Transaction[];
};

type Transaction = {
  id: string;
  accountId: string;
  categoryId: string;
  date: Date;
  inflow: Decimal | null;
  outflow: Decimal | null;
  payee: string | null;
  memo: string | null;
  cleared: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: string;
  type: "EXPENSE" | "INCOME";
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
    // Normalize accounts
    normalizedData.accounts[account.id] = {
      id: account.id,
      userId: account.userId,
      name: account.name,
      type: account.type,
      balance: account.balance,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      // Store transaction IDs for later reference
      transactions: [],
    };

    account.transactions.forEach((transaction) => {
      // Normalize transactions
      normalizedData.transactions[transaction.id] = {
        id: transaction.id,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        date: transaction.date,
        inflow: transaction.inflow,
        outflow: transaction.outflow,
        payee: transaction.payee,
        memo: transaction.memo,
        cleared: transaction.cleared,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      };

      // Normalize categories (if not already added)
      if (!normalizedData.categories[transaction.categoryId]) {
        normalizedData.categories[transaction.categoryId] = {
          id: transaction.categoryId,
          type: "EXPENSE", // Assuming `type` exists within transaction
          name: "placeholder", // Assuming `name` exists within transaction
          // type: transaction.type, // Assuming `type` exists within transaction
          // name: transaction.name, // Assuming `name` exists within transaction
        };
      }
    });
  });

  return normalizedData;
}
