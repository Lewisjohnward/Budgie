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
import { TransactionEditorRow } from "./transactionEditorRow/TransactionEditorRow";
import { ActionBar } from "./ActionBar";
import clsx from "clsx";
import { Button } from "@/core/components/uiLibrary/button";
import { TransactionEditor, TransactionTable } from "../hooks/useAccount";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

type AccountTableProps = {
  table: TransactionTable;
  transactionEditor: TransactionEditor;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  disableVirtualisation?: boolean;
};

export function AccountTable({
  table,
  transactionEditor,
  onDeleteSelected,
  onDuplicateSelected,
  disableVirtualisation = false,
}: AccountTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rows = table.table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const rowsToRender = disableVirtualisation
    ? rows.map((row, index) => ({ row, index }))
    : virtualRows.map((virtualRow) => ({
      row: rows[virtualRow.index],
      index: virtualRow.index,
    }));

  const visibleColumnCount = table.table.getVisibleLeafColumns().length;
  const isTransactionEditorOpen = transactionEditor.state.open;

  return (
    <>
      {/* <section */}
      {/*   aria-label="Transaction table" */}
      {/*   onClick={transactionForm.state.open ? table.onInteraction : undefined} */}
      {/*   className="flex-1 overflow-auto" */}
      {/* > */}
      <Table
        containerRef={tableContainerRef}
        onClick={transactionEditor.state.open ? table.onInteraction : undefined}
        aria-label="Transactions"
        className="table-fixed"
        style={{
          width: "100%",
          minWidth: table.table.getTotalSize(),
        }}
      >
        <TableHeader>
          {table.table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="sticky top-0 p-0 z-50 bg-white text-nowrap text-ellipsis"
                    style={{
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      maxWidth: header.getSize(),
                    }}
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
          {isTransactionEditorOpen ? (
            <>
              {transactionEditor.state.editingTransactionId === undefined && (
                <TransactionEditorRow transactionEditor={transactionEditor} />
              )}

              {rows.map((row) =>
                row.id === transactionEditor.state.editingTransactionId ? (
                  <TransactionEditorRow
                    key={`edit-${row.id}`}
                    transactionEditor={transactionEditor}
                  />
                ) : (
                  <TableRow
                    key={row.id}
                    className={clsx(
                      transactionEditor.isDirty && "hover:bg-transparent"
                    )}
                    aria-selected={row.getIsSelected()}
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
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                          overflow: "hidden",
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )}
            </>
          ) : (
            <>
              {!disableVirtualisation && virtualRows.length > 0 && (
                <TableRow
                  aria-hidden="true"
                  className="border-0 hover:bg-transparent"
                >
                  <TableCell
                    colSpan={visibleColumnCount}
                    className="border-0 p-0"
                    style={{ height: virtualRows[0].start }}
                  />
                </TableRow>
              )}

              {rowsToRender.map(({ row, index }) => (
                <ContextMenu modal key={row.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      data-index={index}
                      ref={
                        disableVirtualisation
                          ? undefined
                          : rowVirtualizer.measureElement
                      }
                      aria-selected={row.getIsSelected()}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={(e) => table.onRowSelection(e, row)}
                      onContextMenu={() => table.onRowSelectionContextMenu(row)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: cell.column.getSize(),
                            minWidth: cell.column.getSize(),
                            maxWidth: cell.column.getSize(),
                            overflow: "hidden",
                          }}
                        >
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
              ))}

              {!disableVirtualisation && virtualRows.length > 0 && (
                <TableRow
                  aria-hidden="true"
                  className="border-0 hover:bg-transparent"
                >
                  <TableCell
                    colSpan={visibleColumnCount}
                    className="border-0 p-0"
                    style={{
                      height:
                        rowVirtualizer.getTotalSize() -
                        virtualRows[virtualRows.length - 1].end,
                    }}
                  />
                </TableRow>
              )}
            </>
          )}

          {table.isFiltered && (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={visibleColumnCount} className="text-center">
                <div className="py-4 space-y-4">
                  <p className="font-[400]">
                    Some transactions are hidden by your search{" "}
                    <span className="font-bold">
                      {`"${table.filterState.searchFilter.filters}"`}
                    </span>
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
      <ActionBar
        rowCount={table.numberOfRows}
        display={table.displaySelectionModal}
        cancel={table.cancelSelection}
      />
    </>
  );
}
