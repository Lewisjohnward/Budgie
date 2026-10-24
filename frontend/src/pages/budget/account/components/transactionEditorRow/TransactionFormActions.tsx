import { TableRow, TableCell } from "@/core/components/uiLibrary/table";
import { Button } from "@/core/components/uiLibrary/button";
import { TransactionEditorMode } from "../../hooks/useTransactionEditor";

type TransactionEditorActionsProps = {
  showWarning: boolean;
  columnCount: number;
  mode: TransactionEditorMode;
  onCancel: () => void;
  onSaveTransaction: () => void;
  onSaveAndAddAnotherTransaction: () => void;
};

export function TransactionEditorActions({
  showWarning,
  columnCount,
  mode,
  onSaveAndAddAnotherTransaction,
  onSaveTransaction,
  onCancel,
}: TransactionEditorActionsProps) {
  return (
    <TableRow
      className={
        showWarning
          ? "bg-green-500/30 hover:bg-green-500/30"
          : "bg-blue-700/20 hover:bg-blue-700/20"
      }
    >
      <TableCell colSpan={columnCount}>
        <div className="flex justify-end gap-2">
          <Button
            onClick={onCancel}
            className="h-5 w-[80px] py-3 rounded-sm bg-sky-700/10 text-sky-700 border border-sky-700 hover:bg-sky-700/30"
          >
            Cancel
          </Button>
          {mode === TransactionEditorMode.Edit ? (
            <Button
              onClick={onSaveTransaction}
              className="h-5 py-3 rounded-sm px-4 bg-sky-700 text-white border border-sky-700 hover:bg-sky-800"
            >
              Save
            </Button>
          ) : (
            <>
              <Button
                onClick={onSaveTransaction}
                type="submit"
                className="h-5 w-[80px] py-3 rounded-sm bg-sky-700 text-white hover:bg-sky-800"
              >
                Submit
              </Button>
              <Button
                onClick={onSaveAndAddAnotherTransaction}
                className="h-5 py-3 rounded-sm px-4 bg-sky-700 text-white border border-sky-700 hover:bg-sky-800"
              >
                Save and add another
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
