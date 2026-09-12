import { AccountLayout } from "./components/AccountLayout";
import { AccountAlert } from "./components/AccountAlert";
import { AccountHeader } from "./components/AccountHeader";
import { AccountInfo } from "./components/AccountInfo";
import { AccountActions } from "./components/AccountActions";
import { AccountTable } from "./components/AccountTable";
import { useAccount } from "./hooks/useAccount";
import { useEffect } from "react";

export default function Account() {
  const {
    account,
    isDisplayingAllAccounts,
    accountsAvailable,
    table,
    displayTransactionFormRow,
    transactionForm,
    uncategorisedTransactions,
    handleDeleteSelectedTransactions,
    handleDuplicateTransactions,
  } = useAccount();

  // TODO:(lewis 2025-12-03 12:57) can this go in useAccount?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        table.cancelSelection();
        transactionForm.close();
      }
      if (e.key === "N" && e.shiftKey) {
        // TODO:(lewis 2025-12-03 15:00) dont like this, should it be a method on transactionForm?
        displayTransactionFormRow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [table]);

  return (
    <AccountLayout
      alert={<AccountAlert count={uncategorisedTransactions.count} />}
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
          onAddTransaction={displayTransactionFormRow}
          disabled={!accountsAvailable}
          filterState={table.filterState}
        />
      }
      table={
        <AccountTable
          table={table}
          transactionForm={transactionForm}
          onDeleteSelected={handleDeleteSelectedTransactions}
          onDuplicateSelected={handleDuplicateTransactions}
        />
      }
    />
  );
}
