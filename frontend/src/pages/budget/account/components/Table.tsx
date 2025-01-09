import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/uiLibrary/table";
import { ReactNode, useState } from "react";
import { ArrowDown, ArrowUp, Copy, MoveRight, Trash2 } from "lucide-react";
import { Button } from "@/core/components/uiLibrary/button";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Transaction } from "../Account";
import clsx from "clsx";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/core/components/uiLibrary/context-menu";
import { useDeleteTransactionMutation } from "@/core/api/budgetApiSlice";

type TableProps = {
  transactions: Transaction[];
};
const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    enableResizing: false,
    size: 40,
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
    size: 200,
    header: ({ column }) => {
      return <SortButton column={column}>Date</SortButton>;
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      const formattedDate = new Intl.DateTimeFormat("en-GB").format(date);
      return <TextCell> {formattedDate} </TextCell>;
    },
  },

  {
    accessorKey: "payee",
    enableResizing: true,
    size: 300,
    header: ({ column }) => {
      return <SortButton column={column}>Payee</SortButton>;
    },
    cell: ({ row }) => {
      return <TextCell>{row.getValue("payee")}</TextCell>;
    },
  },
  {
    accessorKey: "category",
    size: 200,
    header: ({ column }) => {
      return <SortButton column={column}>Category</SortButton>;
    },
    cell: ({ row }) => {
      const category = row.getValue("category");
      return <TextCell>{category.name}</TextCell>;
    },
  },
  {
    accessorKey: "memo",
    enableResizing: true,
    size: 300,
    header: ({ column }) => {
      return <SortButton column={column}>Memo</SortButton>;
    },
    cell: ({ row }) => {
      return <TextCell>{row.getValue("memo")}</TextCell>;
    },
  },
  {
    accessorKey: "outflow",
    enableResizing: true,
    size: 200,
    header: ({ column }) => {
      return <SortButton column={column}>Outflow</SortButton>;
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("outflow"));
      if (amount === 0) return null;
      const formatted = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(amount);

      return <TextCell>{formatted}</TextCell>;
    },
  },
  {
    accessorKey: "inflow",
    enableResizing: false,
    size: 200,
    header: ({ column }) => {
      return <SortButton column={column}>Inflow</SortButton>;
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("inflow"));
      if (amount === 0) return null;
      const formatted = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(amount);

      return <TextCell>{formatted}</TextCell>;
    },
  },
];

function TextCell({
  children,
  ...props
}: { children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="text-nowrap overflow-hidden text-ellipsis" {...props}>
      {children}
    </div>
  );
}

function SortButton({
  column,
  children,
}: {
  column: Column<Transaction, unknown>;
  children: React.ReactNode;
}) {
  const isSorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="w-full flex items-center justify-between hover:bg-transparent"
    >
      <span>{children}</span>
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

const useTransactionManager = () => {
  const [deleteTransaction] = useDeleteTransactionMutation();

  const handleDeleteTranscation = (id: string) => {
    deleteTransaction({ transactionIds: [id] });
  };

  const handleDuplicateTransaction = (id: string) => {
    console.log("dup");
  };

  const handleMoveTransaction = (id: string) => {
    console.log("move");
  };

  return {
    handleDeleteTranscation,
    handleDuplicateTransaction,
    handleMoveTransaction,
  };
};

export function MyTable({ transactions }: TableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [disableContextMenu, setDisableContextMenu] = useState<boolean>(false);
  const {
    handleDeleteTranscation,
    handleDuplicateTransaction,
    handleMoveTransaction,
  } = useTransactionManager();

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    enableColumnResizing: true,
    enableRowSelection: true,
    state: {
      sorting,
      rowSelection,
    },
  });

  const handleRowClick = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    rowIndex: number,
  ) => {
    console.log(e.shiftKey);
    if (highlightedRow === rowIndex) {
      setDisableContextMenu(true);
      setEditingRow(rowIndex);
    } else {
      setDisableContextMenu(false);
      setHighlightedRow(rowIndex);
      setEditingRow(null);
    }
  };

  return (
    <Table
      className="table-fixed select-none"
      style={{ width: `${table.getTotalSize()}px` }}
      onContextMenu={(e) => {
        e.preventDefault();
        setEditingRow(null);
        setDisableContextMenu(false);
      }}
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const isResizable = header.column.getCanResize();
              return (
                <TableHead
                  key={header.id}
                  className="relative border border-r-neutral-300 text-nowrap text-ellipsis overflow-hidden"
                  style={{ width: `${header.getSize()}px` }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={clsx(
                      isResizable
                        ? "cursor-col-resize hover:bg-blue-950"
                        : "cursor-auto",
                      "absolute top-0 right-0 w-[2px] h-full",
                    )}
                  />
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="border border-r-neutral-300">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <>
              <ContextMenu>
                <ContextMenuTrigger asChild disabled={disableContextMenu}>
                  <TableRow
                    key={row.id}
                    data-state={highlightedRow === row.index && "selected"}
                    className={clsx(
                      editingRow === row.index && "border-b-0",
                      "data-[state=selected]:bg-sky-950/20 cursor-pointer",
                    )}
                    onClick={(e) => {
                      handleRowClick(e, row.index);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: `${cell.column.getSize()}px` }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40">
                  <ContextMenuItem
                    onClick={() => handleDeleteTranscation(row.original.id)}
                  >
                    Delete
                    <div>
                      <Trash2 size={15} />
                    </div>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleDuplicateTransaction(row.original.id)}
                  >
                    Duplicate
                    <div>
                      <Copy size={15} />
                    </div>
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled
                    onClick={() => handleMoveTransaction(row.original.id)}
                  >
                    Move to account
                    <div>
                      <MoveRight size={15} />
                    </div>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              {highlightedRow === row.index && editingRow === row.index && (
                <TableCell
                  colSpan={7}
                  className="bg-sky-950/20"
                  onClick={() => setEditingRow(null)}
                >
                  <div className="flex justify-end">
                    <div className="space-x-2">
                      <Button
                        variant={"outline"}
                        className="text-sky-950/80 bg-transparent border-blue-950/80 hover:bg-sky-950/30"
                      >
                        Cancel
                      </Button>
                      <Button className="text-white bg-sky-950/80 hover:bg-sky-950/30">
                        Save
                      </Button>
                    </div>
                  </div>
                </TableCell>
              )}
            </>
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
  );
}
