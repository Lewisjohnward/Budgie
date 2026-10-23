import { MdDelete } from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import { flexRender } from "@tanstack/react-table";
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
import { TransactionEditorRow } from "./transactionFormRow/TransactionEditorRow";
import { SelectionModal } from "./RowSelectionModal";
import { columns } from "./columns";
import clsx from "clsx";
import { Button } from "@/core/components/uiLibrary/button";
import { TransactionEditor, TransactionTable } from "../hooks/useAccount";

type AccountTableProps = {
  table: TransactionTable;
  transactionEditor: TransactionEditor;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
};

export function AccountTable({
  table,
  transactionEditor,
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
        onClick={transactionEditor.state.open ? table.onInteraction : undefined}
        aria-label="Transactions"
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
          {transactionEditor.state.open &&
            transactionEditor.state.editingTransactionId === undefined && (
              // Add transaction
              <TransactionEditorRow transactionEditor={transactionEditor} />
            )}
          {table.table.getRowModel().rows?.length > 0 &&
            table.table.getRowModel().rows.map((row) =>
              row.id === transactionEditor.state.editingTransactionId &&
                transactionEditor.state.open ? (
                // Edit transaction
                <TransactionEditorRow
                  key={`edit-${row.id}`}
                  transactionEditor={transactionEditor}
                />
              ) : transactionEditor.state.open ? (
                <TableRow
                  className={clsx(
                    transactionEditor.isDirty && "hover:bg-transparent"
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
                      onClick={(e) => table.onRowSelection(e, row)}
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
