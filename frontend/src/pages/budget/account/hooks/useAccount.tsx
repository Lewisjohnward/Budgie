import { useEffect, useRef } from "react";
import {
  useDeleteTransactionMutation,
  useDuplicateTransactionsMutation,
} from "@/core/api/budgetApiSlice";
import { useTransactionTable } from "./useTransactionTable";
import { useAccountData } from "./useAccountData";
import {
  TransactionFormMode,
  useTransactionFormRow,
} from "./useTransactionFormRow";

export const useAccount = () => {
  const { currentAccount, accountsAvailable } = useAccountData();
  const transactionTable = useTransactionTable(
    currentAccount.transactions,
    currentAccount.id
  );
  const transactionFormRow = useTransactionFormRow(currentAccount.id);

  const handleRowSelection = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    row: any
  ) => {
    if (transactionFormRow.isDirty) return;
    if (transactionFormRow.addTransactionState.open) {
      transactionFormRow.closeAddTransactionForm();
    }

    if (e.ctrlKey) {
      transactionTable.onRowSelection(e, row);
      return;
    }

    if (e.shiftKey) {
      transactionTable.onRowSelection(e, row);
      return;
    }

    if (row.getIsSelected()) {
      transactionTable.table.resetRowSelection();
      transactionFormRow.loadTransactionForEdit(row.original, row.id);
      return;
    }
    transactionTable.onRowSelection(e, row);
  };

  // Reset table selection state and form state when account changes
  useEffect(() => {
    transactionTable.table.resetRowSelection();
    transactionFormRow.setAddtransactionState({
      open: false,
      mode: TransactionFormMode.Edit,
      displayAccountField: false,
      accountId: "",
      showWarning: false,
      editingRowIndex: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount.id]);

  const displayTransactionFormRow = () => {
    transactionFormRow.resetToNewTransaction();
    transactionTable.cancelSelection();
    transactionFormRow.setAddtransactionState({
      open: true,
      mode: TransactionFormMode.Add,
      displayAccountField: currentAccount.id === "all",
      accountId: currentAccount.id || "",
      showWarning: false,
      editingRowIndex: undefined,
    });
  };

  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  const handleTableInteraction = () => {
    transactionFormRow.handleTableInteraction();
  };

  const uncategorisedTxsCount = currentAccount.transactions.filter(
    (t) => t.categoryGroup?.name === "Uncategorised"
  ).length;

  const [deleteTransaction] = useDeleteTransactionMutation();
  const [duplicateTransactions] = useDuplicateTransactionsMutation();

  const handleDeleteSelectedTransactions = () => {
    deleteTransaction({ transactionIds: transactionTable.selectedRowIds });
    transactionTable.cancelSelection();
  };

  const handleDuplicateTransactions = () => {
    const rows = transactionTable.table.getRowModel().rows;
    const selectedRowIds = Object.keys(
      transactionTable.table.getState().rowSelection
    ).filter((id) => transactionTable.table.getState().rowSelection[id]);

    const transactionIds = rows
      .filter((row) => selectedRowIds.includes(row.id))
      .map((row) => row.original.id);

    duplicateTransactions({ transactionIds });
  };

  return {
    //account
    account: currentAccount,
    accountsAvailable,
    //table
    table: {
      ...transactionTable,
      onRowSelection: handleRowSelection,
      onInteraction: handleTableInteraction,
    },
    // crud
    handleDeleteSelectedTransactions,
    handleDuplicateTransactions,

    displayTransactionFormRow,
    transactionForm: {
      form: transactionFormRow.form,
      state: transactionFormRow.addTransactionState,
      close: transactionFormRow.closeAddTransactionForm,
      resetWarning: transactionFormRow.resetWarning,
      handleSaveTransaction: transactionFormRow.handleSaveTransaction,
      handleSaveAndAddAnother:
        transactionFormRow.handleSaveAndAddAnotherTransaction,
      onClick: transactionFormRow.handleFormRowClick,
      isDirty: transactionFormRow.isDirty,
      selectDate: transactionFormRow.selectDate,
      selectCategory: transactionFormRow.selectCategory,
      selectPayee: transactionFormRow.selectPayee,
    },
    uncategorisedTransactions: {
      count: uncategorisedTxsCount,
      onClick: () => {
        console.log("view uncat trans");
      },
    },
  };
};

export type AccountTableState = ReturnType<typeof useAccount>;
export type TransactionFormManager = AccountTableState["transactionForm"];

// const handleSubmitTransaction = async () => {
//   const dummyTransaction = {
//     accountId,
//     // categoryId, doesn't need to be sent, by default will be this needs a category
//     // date, default is today
//     // inflow: 0.31,
//     outflow: 5.69,
//     // payee, not needed
//     // TODO: FIX BUG BELOW
//     // date: "2024-12-31", SENDING THIS will pass zod but fail db BUG!!!
//     date: "2025-01-03T00:00:00.000Z",
//     memo: "Sainsbury's hyper cheese bargs",
//   };
// };
