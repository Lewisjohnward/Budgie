import { Navigate, useParams } from "react-router-dom";
import { AccountLayout } from "./components/AccountLayout";
import { AccountAlert } from "./components/AccountAlert";
import { AccountHeader } from "./components/AccountHeader";
import { AccountInfo } from "./components/AccountInfo";
import { AccountActions } from "./components/AccountActions";
import { AccountTable } from "./components/AccountTable";
import { useAccount } from "./hooks/useAccount";
import { useBudgetSnapshot } from "@/pages/budget/allocation/hooks/useAllocation/useCategories";
import { AccountId } from "@/pages/budget/allocation/types/types";
import { useEffect } from "react";

export default function Account() {
  const { accountId } = useParams<{ accountId: AccountId }>();
  const {
    data: { accounts },
  } = useBudgetSnapshot();

  if (!accountId || (accountId !== "all" && !accounts[accountId])) {
    const destination =
      Object.keys(accounts).length > 0
        ? "/budget/account/all"
        : "/budget/allocation";

    return <Navigate to={destination} replace />;
  }

  return <AccountContent accountId={accountId} />;
}

type AccountContentProps = {
  accountId: AccountId;
};

function AccountContent({ accountId }: AccountContentProps) {
  const {
    account,
    isDisplayingAllAccounts,
    accountsAvailable,
    table,
    displayTransactionEditor,
    transactionEditor,
    uncategorisedTransactions,
    handleDeleteSelectedTransactions,
    handleDuplicateTransactions,
  } = useAccount(accountId);

  // TODO:(lewis 2025-12-03 12:57) can this go in useAccount?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        table.cancelSelection();
        transactionEditor.close();
      }
      if (e.key === "N" && e.shiftKey) {
        // TODO:(lewis 2025-12-03 15:00) dont like this, should it be a method on transactionForm?
        displayTransactionEditor();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [table]);

  return (
    <AccountLayout
      alert={
        <AccountAlert
          onClick={() => {}}
          count={uncategorisedTransactions.count}
        />
      }
      header={
        <AccountHeader
          name={account.name}
          type={account.type}
          showEditButton={!isDisplayingAllAccounts}
          onEdit={() => {
            // TODO:(lewis 2026-09-10 09:24) implement account editing
          }}
        />
      }
      info={<AccountInfo balance={account.balance} />}
      actions={
        <AccountActions
          onAddTransaction={displayTransactionEditor}
          disabled={!accountsAvailable}
          filterState={table.filterState}
        />
      }
      table={
        <AccountTable
          table={table}
          transactionEditor={transactionEditor}
          onDeleteSelected={handleDeleteSelectedTransactions}
          onDuplicateSelected={handleDuplicateTransactions}
        />
      }
    />
  );
}
