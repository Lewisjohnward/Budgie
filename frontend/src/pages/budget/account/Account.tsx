import { CirclePlus, Ellipsis, Pencil, X } from "lucide-react";
import { MdDelete } from "react-icons/md";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/core/components/uiLibrary/context-menu";
import { useParams } from "react-router-dom";
import {
  useDeleteTransactionMutation,
  useDuplicateTransactionsMutation,
  useGetAccountsQuery,
} from "@/core/api/budgetApiSlice";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/uiLibrary/table";
import { Button } from "@/core/components/uiLibrary/button";
import { FaCopy, FaRegCreditCard, FaRegMoneyBillAlt } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { toggleEditAccount } from "@/core/slices/dialogSlice";
import { numberToCurrency } from "@/core/lib/numberToCurrency";
import React from "react";
import { TransactionFormRow } from "./components/transactionFormRow/TransactionFormRow";
import { Separator } from "./components/Separator";
import { SelectionModal } from "./components/RowSelectionModal";
import { columns } from "./components/columns";
import {
  closeTransactionFormRow,
  openTransactionFormRow,
  transactionFormRow,
} from "@/pages/budget/account/slices/transactionFormRowSlice";
import clsx from "clsx";

type Category = {
  id: string;
  userId: string;
  name: string;
  categoryGroupId: string;
};

type CategoryGroup = {
  id: string;
  userId: string;
  name: string;
};

type Transaction = {
  id: string;
  accountId: string;
  categoryId: string | null;
  date: string;
  inflow: number | null;
  outflow: number | null;
  payee: string | null;
  memo: string | null;
  cleared: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  categoryGroup: CategoryGroup | null;
};

export function Account() {
  const { data } = useGetAccountsQuery();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [duplicateTransactions] = useDuplicateTransactionsMutation();
  const [addingTransaction, setAddingTransaction] = useState(false);
  const dispatch = useAppDispatch();
  const handleOpenDialog = () => dispatch(toggleEditAccount());
  const transactionFormRowState = useAppSelector(transactionFormRow);
  if (!data) return <div>There has been an error</div>;
  const { accountId } = useParams();
  const chosenAccount =
    accountId === "all"
      ? "all"
      : Object.values(data.accounts).find(({ id }) => id === accountId);

  if (!chosenAccount || !accountId) {
    throw new Error(`Account with ID ${accountId} not found`);
  }
  const displayTransactionFormRow = () => {
    dispatch(
      openTransactionFormRow({
        displayAccount: chosenAccount === "all",
        accountId,
      }),
    );
  };

  const handleSubmitTransaction = async () => {
    const dummyTransaction = {
      accountId,
      // categoryId, doesn't need to be sent, by default will be this needs a category
      // date, default is today
      // inflow: 0.31,
      outflow: 5.69,
      // payee, not needed
      // TODO: FIX BUG BELOW
      // date: "2024-12-31", SENDING THIS will pass zod but fail db BUG!!!
      date: "2025-01-03T00:00:00.000Z",
      memo: "Sainsbury's hyper cheese bargs",
    };
  };

  // TODO: NEED TO PUT ACCOUNT NAME IN ALL

  const transactions = useMemo(() => {
    const allTransactions = Object.values(data.transactions);
    const accounts = data.accounts;

    const filteredTransactions =
      chosenAccount === "all"
        ? allTransactions
        : allTransactions.filter(({ accountId: id }) => id === accountId);

    return filteredTransactions.map((transaction) => {
      const category = data.categories[transaction.categoryId];
      const categoryGroup = category
        ? data.categoryGroups[category.categoryGroupId]
        : null;

      const unassigned = categoryGroup?.name === "Uncategorised";

      return {
        ...transaction,
        accountName: accounts[transaction.accountId].name,
        category,
        categoryGroup,
        unassigned,
      };
    });
  }, [data, accountId]);

  const sumBalance = Object.values(data.accounts).reduce(
    (acc, val) => acc + val.balance,
    0,
  );

  const account =
    chosenAccount === "all"
      ? {
          name: "All Accounts",
          type: "",
          balance: sumBalance,
          transactions,
        }
      : {
          name: chosenAccount.name,
          type: chosenAccount.type,
          balance: chosenAccount.balance,
          transactions,
        };

  const accountsAvailable = Object.keys(data.accounts).length > 0;

  ///// TABLE

  useEffect(() => {
    table.resetRowSelection();
    setAddingTransaction(false);
    dispatch(closeTransactionFormRow());
  }, [accountId]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [lastRowSelection, setLastRowSelection] = useState<RowSelectionState>(
    {},
  );

  const table = useReactTable({
    data: account.transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection, //hoist up the row selection state to your own scope
    // getRowId: (row) => row.id,
    state: {
      rowSelection, //pass the row selection state back to the table instance
      columnVisibility: {
        account: accountId === "all", // 👈 only show "account" column on /all
      },
    },
  });

  const onRowSelection = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    row,
  ) => {
    if (e.shiftKey) {
      const start = Number(Object.keys(lastRowSelection));
      const end = Number(row.id);
      const [min, max] = start < end ? [start, end] : [end, start];
      const selectedRows = Object.fromEntries(
        Array.from({ length: max - min + 1 }, (_, i) => [min + i, true]),
      );
      table.setRowSelection({ ...rowSelection, ...selectedRows });
    } else if (e.ctrlKey) {
      const id = row.id;
      table.setRowSelection((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    } else {
      table.resetRowSelection();
      row.toggleSelected();
    }
    setLastRowSelection({ [row.id]: true });
  };

  const onRowSelectionContextMenu = (row) => {
    if (!rowSelection[row.id]) {
      table.setRowSelection({ [row.id]: true });
      setLastRowSelection({ [row.id]: true });
    }
  };

  const hoverEnabled = !addingTransaction && !table.getIsSomeRowsSelected();

  const selectedRowIds = Object.keys(rowSelection).map(
    (key) => account.transactions[Number(key)].id,
  );

  const numberOfRows = Object.keys(rowSelection).length;
  const displaySelectionModal = numberOfRows > 0;
  const cancelSelection = () => setRowSelection({});

  const deleteSelectedTransactions = () => {
    deleteTransaction({ transactionIds: selectedRowIds });
    cancelSelection();
  };

  const handleDuplicateTransactions = () => {
    const rows = table.getRowModel().rows;
    const selectedRowIds = Object.keys(rowSelection).filter(
      (id) => rowSelection[id],
    );

    const transactionIds = rows
      .filter((row) => selectedRowIds.includes(row.id))
      .map((row) => row.original.id);

    duplicateTransactions({ transactionIds });
  };

  return (
    <div className="space-y-2 pt-4">
      <Container>
        <div className="flex justify-between">
          <div>
            <AccountName>{account.name}</AccountName>
            {account.type === "BANK" && <BankType />}
            {account.type === "CREDIT_CARD" && <CreditCardType />}
          </div>
          {chosenAccount != "all" ? (
            <Button
              onClick={handleOpenDialog}
              className="bg-blue-700/20 hover:bg-blue-700/30 shadow-none"
            >
              <Pencil className="text-blue-800" />
            </Button>
          ) : null}
        </div>
      </Container>
      <Separator />
      <Container>
        <Balance balance={account.balance} />
      </Container>
      <Separator />
      <Container>
        <AddTransactionButton
          onClick={displayTransactionFormRow}
          disabled={!accountsAvailable}
        />
      </Container>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="relative border border-r-neutral-300 text-nowrap text-ellipsis overflow-hidden"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {transactionFormRowState.open && <TransactionFormRow />}
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) =>
              // row.getIsSelected() ? (
              false ? (
                <TransactionFormRow
                // displayAccount={chosenAccount === "all"}
                // accountId={accountId}
                // transactionId={row.original.id}
                // cancel={() => row.toggleSelected()}
                />
              ) : (
                <ContextMenu modal>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      // className={row.getIs ? "" : "hover:bg-transparent"}
                      onClick={(e) => onRowSelection(e, row)}
                      onContextMenu={() => onRowSelectionContextMenu(row)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64 text-gray-700">
                    <ContextMenuItem
                      onClick={deleteSelectedTransactions}
                      className="justify-start gap-4"
                    >
                      <MdDelete />
                      Delete
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={handleDuplicateTransactions}
                      className="justify-start gap-4"
                    >
                      <FaCopy />
                      Duplicate
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ),
            )
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <SelectionModal
        rowCount={numberOfRows}
        display={displaySelectionModal}
        cancel={cancelSelection}
      />
    </div>
  );
}

// COMPONENTS

function BankType() {
  return (
    <div className="flex items-center gap-[5px]">
      <FaRegMoneyBillAlt className="text-gray-600" />
      <p className="text-sm text-gray-600">Bank Account</p>
    </div>
  );
}

function CreditCardType() {
  return (
    <div className="flex items-center gap-[5px]">
      <FaRegCreditCard className="text-gray-600" />
      <p className="text-sm text-gray-600">Credit Card</p>
    </div>
  );
}

function Balance({ balance }: { balance: number }) {
  const color = balance >= 0 ? "text-green-600" : "text-red-600";
  const formattedBalance = numberToCurrency(balance);

  return (
    <div>
      <p className={`${color} font-semibold`}>{formattedBalance}</p>
      <p className="text-gray-600">Balance</p>
    </div>
  );
}

function AccountName({ children }: { children: ReactNode }) {
  return <h1 className="font-bold text-2xl tracking-wide">{children}</h1>;
}

function Container({ children }: { children: ReactNode }) {
  return <div className="px-4 py-2">{children}</div>;
}

function AddTransactionButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      className={clsx(
        disabled ? "opacity-40" : "hover:bg-sky-950/10",
        "flex items-center gap-2 px-2 py-2 text-sky-950 border border-sky-950/40 rounded text-sm",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <CirclePlus size={15} />
      Add Transaction
    </button>
  );
}
