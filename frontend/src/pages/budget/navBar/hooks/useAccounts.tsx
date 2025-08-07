import { useGetAccountsQuery } from "@/core/api/budgetApiSlice";
import { useState } from "react";

export const useAccounts = () => {
  const { data } = useGetAccountsQuery();
  if (!data) {
    throw new Error("temp placeholder");
  }

  const [expanded, setExpanded] = useState(true);

  const accounts = Object.values(data.accounts);
  const balance = accounts
    .map((account) => account.balance)
    .reduce((sum, balance) => {
      return sum + balance;
    }, 0);

  const bankAccounts = Object.values(data.accounts).filter(
    (account) => account.type === "BANK"
  );

  const userHasAccounts = accounts.length > 0;

  return {
    userHasAccounts,
    accounts: {
      cash: {
        hasAccounts: bankAccounts.length > 0,
        expanded,
        toggleExpanded: () => {
          setExpanded((prev) => !prev);
        },
        accounts: bankAccounts,
      },
    },
    balance,
  };
};
