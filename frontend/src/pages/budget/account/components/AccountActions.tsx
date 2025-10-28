import { CirclePlus, Redo2, Undo2 } from "lucide-react";
import clsx from "clsx";
import { TransactionSearchFilter } from "./TransactionSearchFilter";
import { TransactionDateFilter } from "./TransactionDateFilter";

type AccountActionsProps = {
  onAddTransaction: () => void;
  filterState: any;
  disabled: boolean;
};

export function AccountActions({
  onAddTransaction,
  filterState,
  disabled,
}: AccountActionsProps) {
  const undoDisabled = false;
  const redoDisabled = false;

  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <button
          className={clsx(
            disabled ? "opacity-40" : "hover:bg-blue-700/10",
            "flex items-center justify-center gap-2 h-7 px-2 py-0 text-sky-700 rounded text-sm"
          )}
          onClick={onAddTransaction}
          disabled={disabled}
        >
          <CirclePlus size={15} />
          Add Transaction
        </button>
        <div className="w-[1px] bg-gray-400/30" />
        <button
          className={clsx(
            disabled ? "opacity-40" : "hover:bg-blue-700/10",
            "flex items-center justify-center gap-2 h-7 px-2 py-0 text-sky-700 rounded text-sm"
          )}
          onClick={onAddTransaction}
          disabled={undoDisabled}
        >
          <Undo2 size={15} />
          Undo
        </button>
        <button
          className={clsx(
            disabled ? "opacity-40" : "hover:bg-blue-700/10",
            "flex items-center justify-center gap-2 h-7 px-2 py-0 text-sky-700 rounded text-sm"
          )}
          onClick={onAddTransaction}
          disabled={redoDisabled}
        >
          <Redo2 size={15} />
          Redo
        </button>
      </div>
      <div className="flex gap-2">
        <TransactionDateFilter dateFilter={filterState.dateFilter} />
        {/* // TODO(lewis 2025-11-21 18:04): pass as named object */}
        <TransactionSearchFilter {...filterState.searchFilter} />
      </div>
    </div>
  );
}
