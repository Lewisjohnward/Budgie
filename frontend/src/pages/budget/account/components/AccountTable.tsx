import { MdDelete } from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import { flexRender, Table as TanstackTable, Row } from "@tanstack/react-table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/core/components/uiLibrary/context-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/uiLibrary/table";
import { TransactionFormRow } from "./transactionFormRow/TransactionFormRow";
import { SelectionModal } from "./RowSelectionModal";
import { columns } from "./columns";
import clsx from "clsx";
import { Button } from "@/core/components/uiLibrary/button";
import { ChevronRight } from "lucide-react";

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
  category: {
    id: string;
    userId: string;
    name: string;
    categoryGroupId: string;
  } | null;
  categoryGroup: {
    id: string;
    userId: string;
    name: string;
  } | null;
};

type AccountTableProps = {
  table: any; // Should have both TanstackTable and filterState
  transactionForm: any;
  onRowSelection: (
    e: React.MouseEvent,
    row: Row<Transaction>,
    visualIndex?: number
  ) => void;
  onRowSelectionContextMenu: (row: Row<Transaction>) => void;
  onTableInteraction: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  numberOfRows: number;
  displaySelectionModal: boolean;
  onCancelSelection: () => void;
};

export function AccountTable({
  table,
  transactionForm,
  onDeleteSelected,
  onDuplicateSelected,
}: AccountTableProps) {
  return (
    <>
      {/* <section */}
      {/*   aria-label="Transaction table" */}
      {/*   onClick={transactionForm.state.open ? table.onInteraction : undefined} */}
      {/*   className="flex-1 overflow-auto" */}
      {/* > */}
      <Table
        onClick={transactionForm.state.open ? table.onInteraction : undefined}
      >
        <TableHeader>
          {table.table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="sticky top-0 p-0 z-50 bg-white text-nowrap text-ellipsis"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {transactionForm.state.open &&
            transactionForm.state.editingRowIndex === undefined && (
              <TransactionFormRow transactionForm={transactionForm} />
            )}
          <TableCell>19/12/2025</TableCell>
          <TableCell className="flex justify-between gap-4 items-center whitespace-nowrap">
            <p>Transfer: main account</p>
            <ChevronRight size={"15"} />
          </TableCell>
          <TableCell>
            <p className="text-gray-600">Category not needed</p>
          </TableCell>
          <TableCell>memo..</TableCell>
          <TableCell>£5.00</TableCell>
          <TableCell></TableCell>
          {table.table.getRowModel().rows?.length > 0 &&
            table.table.getRowModel().rows.map((row, i) =>
              row.id === transactionForm.state.editingRowIndex &&
              transactionForm.state.open ? (
                <TransactionFormRow
                  key={`edit-${row.id}`}
                  transactionForm={transactionForm}
                />
              ) : transactionForm.state.open ? (
                <TableRow
                  className={clsx(
                    transactionForm.isDirty && "hover:bg-transparent"
                  )}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    table.onInteraction();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    table.onRowSelection(e, row);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ) : (
                <ContextMenu modal>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      // className={row.getIs ? "" : "hover:bg-transparent"}
                      onClick={(e) => table.onRowSelection(e, row, i)}
                      onContextMenu={() => table.onRowSelectionContextMenu(row)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64 text-gray-700">
                    <ContextMenuItem
                      onClick={onDeleteSelected}
                      className="justify-start gap-4"
                    >
                      <MdDelete />
                      Delete
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={onDuplicateSelected}
                      className="justify-start gap-4"
                    >
                      <FaCopy />
                      Duplicate
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )
            )}
          {table.isFiltered && (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={columns.length} className="text-center">
                <div className="py-4 space-y-4">
                  <p className="font-[400]">
                    Some transactions are hidden by your search{" "}
                    <span className="font-bold">{`"${table.filterState.searchFilter.filters}"`}</span>
                  </p>
                  <Button
                    className="bg-blue-700/20 text-blue-800 hover:bg-blue-700/30 shadow-none"
                    onClick={table.clearAllFilters}
                  >
                    View All
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* </section> */}
      <SelectionModal
        rowCount={table.numberOfRows}
        display={table.displaySelectionModal}
        cancel={table.cancelSelection}
      />
    </>
  );
}
