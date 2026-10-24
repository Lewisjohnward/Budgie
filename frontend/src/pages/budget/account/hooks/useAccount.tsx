import { useEffect, useRef } from "react";
import { useTransactionTable } from "./useTransactionTable";
import { useTransactionEditor } from "./useTransactionEditor";
import { useAccountData } from "./useAccountData/useAccountData";
import { AccountId } from "../../allocation/types/types";
import {
  useDeleteTransactionMutation,
  useDuplicateTransactionsMutation,
} from "@/core/api/budget/transaction/transactionApiSlice";

export const useAccount = (accountId: AccountId) => {
  const {
    selectedAccount,
    accountsAvailable,
    numberOfUncategorisedTransactions,
  } = useAccountData({ accountId });
  const transactionTable = useTransactionTable(selectedAccount);
  const transactionEditor = useTransactionEditor(selectedAccount.id);

  const handleRowSelection = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    row: any
  ) => {
    if (transactionEditor.isDirty) return;
    if (transactionEditor.transactionEditorState.open) {
      transactionEditor.cancel();
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
      transactionEditor.loadTransactionForEdit(row.original, row.id);
      return;
    }
    transactionTable.onRowSelection(e, row);
  };

  // Reset table selection state and form state when account changes
  useEffect(() => {
    transactionTable.table.resetRowSelection();
    transactionEditor.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount.id]);

  const openTransactionEditor = () => {
    transactionTable.cancelSelection();
    transactionEditor.open();
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
    transactionEditor.handleTableInteraction();
  };

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

  const isDisplayingAllAccounts = selectedAccount.name === "All Accounts";

  return {
    //account
    account: selectedAccount,
    isDisplayingAllAccounts,
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

    openTransactionEditor,
    transactionEditor: {
      form: transactionEditor.form,
      state: transactionEditor.transactionEditorState,
      cancel: transactionEditor.cancel,
      resetWarning: transactionEditor.resetWarning,
      saveTransaction: transactionEditor.saveTransaction,
      saveAndAddAnotherTransaction:
        transactionEditor.saveAndAddAnotherTransaction,
      isDirty: transactionEditor.isDirty,
      selectDate: transactionEditor.selectDate,
      selectCategory: transactionEditor.selectCategory,
      selectPayee: transactionEditor.selectPayee,
    },
    uncategorisedTransactions: {
      count: numberOfUncategorisedTransactions,
      onClick: () => {
        console.log("view uncat trans");
      },
    },
  };
};

export type AccountTableState = ReturnType<typeof useAccount>;
export type TransactionEditor = AccountTableState["transactionEditor"];
export type TransactionTable = AccountTableState["table"];

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
