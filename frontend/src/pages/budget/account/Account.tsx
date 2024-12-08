import { mockAccounts } from "@/mockData";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useLocation, useParams } from "react-router-dom";

type Transaction = {
  id: string;
  accountId: string;
  categoryId: string;
  budgetId: string;
  date: string;
  payee: string;
  memo: string;
  outflow: number;
  inflow: number;
  cleared: boolean;
  // TODO: don't need these two
  createdAt: string;
  updatedAt: string;
};

type Account = {
  name: string;
  clearedBalance?: number;
  unclearedBalance?: number;
  transactions: Transaction[];
};

export function Account() {
  const { accountId } = useParams();
  const location = useLocation();

  let account: Account;

  if (accountId) {
    const foundAccount = mockAccounts.find((acc) => acc.id === accountId);
    if (!foundAccount) {
      return <h1>Account not found</h1>;
    }

    account = {
      name: foundAccount.name,
      clearedBalance: 0,
      unclearedBalance: 0,
      transactions: foundAccount.transactions,
    };
  } else if (location.pathname === "/budget/account/all") {
    const transactions = mockAccounts.flatMap(
      (account) => account.transactions,
    );

    account = {
      name: "All accounts",
      clearedBalance: 0,
      unclearedBalance: 0,
      transactions,
    };
  }

  // TODO: remove the ! for unassigned below

  return (
    <div className="overflow-x-scroll">
      <div className="p-4">
        <div className="font-bold text-2xl tracking-tight">{account!.name}</div>
      </div>
      <div className="w-full h-[1px] bg-black/20" />
      <MyTable transactions={account!.transactions} />
    </div>
  );
}

type TableProps = {
  transactions: Transaction[];
};

const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    enableResizing: false,
    // size: 20,
    size: 30,
    header: ({ table }) => (
      <div className="flex items-center ">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
  },
  {
    accessorKey: "date",
    enableResizing: true,
    // size: 20,
    header: ({ column }) => {
      return <SortButton column={column} text="Date" />;
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      //"en-US"
      const formattedDate = new Intl.DateTimeFormat("en-GB").format(date);
      return <div className="text-left font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "outflow",
    // header: "Outflow",
    enableResizing: true,
    // size: 20,
    header: ({ column }) => {
      return <SortButton column={column} text={"Outflow"} />;
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("outflow"));
      if (amount === 0) return null; // Or return "" for an empty string
      const formatted = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "inflow",
    enableResizing: true,
    header: ({ column }) => {
      return <SortButton column={column} text={"Inflow"} />;
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("inflow"));
      if (amount === 0) return null; // Or return "" for an empty string
      const formatted = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "payee",
    enableResizing: true,
    header: ({ column }) => {
      return <SortButton column={column} text={"Payee"} />;
    },
  },
  {
    accessorKey: "memo",
    enableResizing: false,
    header: ({ column }) => {
      return <SortButton column={column} text={"Memo"} />;
    },
  },
];

function SortButton({
  column,
  text,
}: {
  column: Column<Transaction, unknown>;
  text: string;
}) {
  const isSorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="w-full flex items-center justify-between hover:bg-transparent"
    >
      <span>{text}</span>
      {isSorted == "asc" ? (
        <ArrowUp />
      ) : isSorted == "desc" ? (
        <ArrowDown />
      ) : (
        ""
      )}
    </Button>
  );
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/uiLibrary/table";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/core/components/uiLibrary/button";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import clsx from "clsx";

function MyTable({ transactions }: TableProps) {
  const [data, setData] = useState(transactions);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    enableColumnResizing: true,
    state: {
      sorting,
      rowSelection,
    },
  });

  // TODO: add resizer

  return (
    <div>
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <Table style={{ width: `${table.getTotalSize()}` }}>
        <TableHeader className="border border-t-gray-300/70">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const isResizable = header.column.getCanResize();
                return (
                  <TableHead
                    key={header.id}
                    className="relative"
                    style={{ width: `${header.getSize()}px` }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    <div
                      // onMouseDown={header.getResizeHandler()}
                      // onTouchStart={header.getResizeHandler()}
                      // className={clsx(
                      //   isResizable ? "cursor-col-resize" : "cursor-auto",
                      //   "absolute top-0 right-0 w-[1px] h-full bg-gray-300",
                      // )}
                      className={clsx(
                        "absolute top-0 right-0 w-[1px] h-full bg-gray-300/70",
                      )}
                    />
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="border border-b-gray-300/70">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: `${cell.column.getSize()}px` }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
