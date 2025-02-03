export type Account = {
  id: string;
  userId: string;
  name: string;
  type: "BANK" | "CREDIT_CARD";
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  transactions: Transaction[];
};

export type Transaction = {
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

export type Category = {
  id: string;
  userId: string;
  // type: "EXPENSE" | "INCOME";
  name: string;
};

export type NormalizedData = {
  accounts: { [key: string]: Account };
  transactions: { [key: string]: Transaction };
  categories: { [key: string]: Category };
};
