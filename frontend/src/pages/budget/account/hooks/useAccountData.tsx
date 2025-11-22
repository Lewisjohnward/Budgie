import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAccountsQuery } from "@/core/api/budgetApiSlice";

type Transaction = {
  id: string;
  accountId: string;
  categoryId: string | null;
  date: Date;
  inflow: number | null;
  outflow: number | null;
  payee: string | null;
  memo: string | null;
  cleared: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: any;
  categoryGroup: any;
};

type Category = {
  id: string;
  name: string;
  categoryGroupId: string;
};

type CategoryGroup = {
  id: string;
  name: string;
};

type DetailedTransaction = Omit<Transaction, "category"> & {
  accountName: string;
  category: Category;
  categoryGroup: CategoryGroup | null;
  unassigned: boolean;
};

type AccountOverview = {
  name: string;
  type: "BANK" | "CREDIT_CARD" | "ALL_ACCOUNTS";
  balance: number;
  transactions: DetailedTransaction[];
  id: string;
};

const emptyAccount: AccountOverview = {
  name: "",
  type: "ALL_ACCOUNTS",
  balance: 0,
  transactions: [],
  id: "",
};

export const useData = () => {
  const { data } = useGetAccountsQuery();
  if (!data) {
    throw new Error("Account data is not available");
  }
  return { data };
};

export const useAccountData = () => {
  const { data } = useData();
  const navigate = useNavigate();

  // get account id
  const { accountId } = useParams();
  const accounts = Object.values(data.accounts);

  // if accountId undefined push home
  if (!accountId) {
    accounts.length > 0
      ? navigate("/budget/account/all")
      : navigate("/budget/allocation");
    // Return empty state while redirecting

    return {
      currentAccount: emptyAccount,
      accountsAvailable: false,
    };
  }

  const chosenAccount = accountId === "all" ? "all" : data.accounts[accountId];

  // if chosenAccount null push user home
  if (!chosenAccount) {
    accounts.length > 0
      ? navigate("/budget/account/all")
      : navigate("/budget/allocation");
    // Return empty state while redirecting
    return {
      currentAccount: emptyAccount,
      accountsAvailable: false,
    };
  }

  // generate transactions
  // - filter for account chosen
  // - add category group and category
  const transactions = useMemo(() => {
    const allTransactions = Object.values(data.transactions);
    const accounts = data.accounts;

    const filteredTransactions =
      chosenAccount === "all"
        ? allTransactions
        : allTransactions.filter(({ accountId: id }) => id === accountId);

    return filteredTransactions.map((transaction) => {
      const { category: _, ...transactionWithoutCategory } = transaction;
      const category = data.categories[transaction.categoryId];
      const categoryGroup = category
        ? data.categoryGroups[category.categoryGroupId]
        : null;

      const unassigned = categoryGroup?.name === "Uncategorised";

      return {
        ...transactionWithoutCategory,
        accountName: accounts[transaction.accountId].name,
        category,
        categoryGroup,
        unassigned,
      };
    });
  }, [data, accountId, chosenAccount]);

  // calculate the sum of the balance for top bar
  const sumBalance = Object.values(data.accounts).reduce(
    (acc, val) => acc + val.balance,
    0
  );

  // create account overview object
  const currentAccount: AccountOverview =
    chosenAccount === "all"
      ? {
          name: "All Accounts",
          type: "ALL_ACCOUNTS",
          balance: sumBalance,
          transactions,
          id: "all",
        }
      : {
          name: chosenAccount.name,
          type: chosenAccount.type,
          balance: chosenAccount.balance,
          transactions,
          id: accountId,
        };

  const accountsAvailable = Object.keys(data.accounts).length > 0;

  return {
    currentAccount,
    accountsAvailable,
  };
};
