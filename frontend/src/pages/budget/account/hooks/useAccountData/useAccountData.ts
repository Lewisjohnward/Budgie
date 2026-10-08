import { useBudgetSnapshot } from "@/pages/budget/allocation/hooks/useAllocation/useCategories";
import { AccountId } from "@/pages/budget/allocation/types/types";
import { useMemo } from "react";
import {
  CategoriesById,
  CategoryGroupsById,
  DetailedTransaction,
  AccountOverview,
} from "./types";

// Input
type UseAccountDataParams = {
  accountId: AccountId;
};

// Output
export type UseAccountData = {
  currentAccount: AccountOverview;
  accountsAvailable: boolean;
};

export const useAccountData = ({
  accountId,
}: UseAccountDataParams): UseAccountData => {
  const {
    data: { categoryGroups, categories, accounts: accountsById, transactions },
  } = useBudgetSnapshot();

  const uncategorisedCategoryId = categories.uncategorised.id;

  const accounts = Object.values(accountsById);

  const chosenAccount = accountId === "all" ? "all" : accountsById[accountId];

  const temp_normalTxs = Object.values(transactions).filter(
    (tx) => tx.type === "normal"
  );

  // generate transactions
  // - filter for account chosen
  // - add category group and category
  const detailedTransactions: DetailedTransaction[] = useMemo(() => {
    const categoriesById: CategoriesById = {
      ...categories.user,
      [categories.rta.id]: categories.rta,
      [categories.uncategorised.id]: categories.uncategorised,
    };

    const categoryGroupsById: CategoryGroupsById = {
      ...categoryGroups.user,
      [categoryGroups.inflow.id]: categoryGroups.inflow,
      [categoryGroups.uncategorised.id]: categoryGroups.uncategorised,
    };

    const allTransactions = temp_normalTxs;

    const filteredTransactions =
      chosenAccount === "all"
        ? allTransactions
        : allTransactions.filter(({ accountId: id }) => id === accountId);

    return filteredTransactions.map((transaction) => {
      const category = categoriesById[transaction.categoryId];

      const categoryGroup = categoryGroupsById[category.categoryGroupId];

      const unassigned = category.id === uncategorisedCategoryId;

      return {
        id: transaction.id,
        accountId: transaction.accountId,
        accountName: accountsById[transaction.accountId].name,
        date: new Date(transaction.date),
        payee: transaction.payeeId,
        categoryGroup: categoryGroup,
        categoryId: transaction.categoryId,
        category,
        unassigned,
        memo: transaction.memo,
        inflow: transaction.inflow,
        outflow: transaction.outflow,
      };
    });
  }, [transactions, accountsById, categories, categoryGroups, accountId]);

  // calculate the sum of the balance for top bar
  const sumBalance = accounts.reduce((acc, val) => acc + val.balance, 0);

  // create account overview object
  const currentAccount: AccountOverview =
    chosenAccount === "all"
      ? {
        name: "All Accounts",
        type: "ALL_ACCOUNTS",
        balance: sumBalance,
        transactions: detailedTransactions,
        id: "all",
      }
      : {
        name: chosenAccount.name,
        type: chosenAccount.type,
        balance: chosenAccount.balance,
        transactions: detailedTransactions,
        id: accountId,
      };

  const accountsAvailable = accounts.length > 0;

  return {
    currentAccount,
    accountsAvailable,
  };
};
