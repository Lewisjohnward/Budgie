import { useState } from "react";
import { useBudgetSnapshot } from "../../allocation/hooks/useAllocation/useCategories";

export const useAccounts = () => {
  const {
    data: { accounts },
  } = useBudgetSnapshot();

  const [expanded, setExpanded] = useState(true);

  const accountsArray = Object.values(accounts);

  const balance = accountsArray
    .map((account) => account.balance)
    .reduce((sum, balance) => {
      return sum + balance;
    }, 0);

  const bankAccounts = accountsArray.filter(
    (account) => account.type === "BANK"
  );

  const userHasAccounts = accountsArray.length > 0;

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
