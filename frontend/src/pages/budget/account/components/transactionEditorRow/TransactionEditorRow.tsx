import { Input } from "@/core/components/uiLibrary/input";
import { FormProvider } from "react-hook-form";
import { TableCell, TableRow } from "@/core/components/uiLibrary/table";
import { TransactionEditor } from "../../hooks/useAccount";
import { SelectPayee } from "./selectPayee";
import { SelectCategory } from "./selectCategory";
import { SelectDate } from "./selectDate/SelectDate";
import { TransactionEditorActions } from "./TransactionFormActions";
import { SelectAccount } from "./selectAccount/selectAccount";

type TransactionEditorRow = {
  transactionEditor: TransactionEditor;
};

export function TransactionEditorRow({
  transactionEditor,
}: TransactionEditorRow) {
  const { register } = transactionEditor.form;

  return (
    <FormProvider {...transactionEditor.form}>
      <TableRow
        aria-label="Transaction editor"
        onFocus={transactionEditor.resetWarning}
        className={
          transactionEditor.state.showWarning
            ? "bg-green-500/30 hover:bg-green-500/30 border-none"
            : "bg-blue-700/20 hover:bg-blue-700/20 border-none"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {transactionEditor.state.displayAccountField && (
          <TableCell>
            <SelectAccount />
          </TableCell>
        )}
        <TableCell>
          <SelectDate selectDate={transactionEditor.selectDate} />
        </TableCell>
        <TableCell>
          <SelectPayee selectPayee={transactionEditor.selectPayee} />
        </TableCell>
        <TableCell>
          <SelectCategory selectCategory={transactionEditor.selectCategory} />
        </TableCell>
        <TableCell>
          <label htmlFor="memo" className="sr-only">
            Memo
          </label>
          <Input
            id="memo"
            className="h-5 py-0 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 overflow-ellipsis rounded-sm shadow-none"
            placeholder="Memo"
            {...register("memo")}
          />
        </TableCell>
        <TableCell>
          <label htmlFor="outflow" className="sr-only">
            Outflow
          </label>
          <Input
            id="outflow"
            className="h-5 py-0 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 overflow-ellipsis rounded-sm shadow-none"
            placeholder={"Outflow"}
            {...register("outflow")}
          />
        </TableCell>
        <TableCell>
          <label htmlFor="inflow" className="sr-only">
            Inflow
          </label>
          <Input
            id="inflow"
            className="h-5 py-0 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 overflow-ellipsis rounded-sm shadow-none"
            placeholder={"Inflow"}
            {...register("inflow")}
          />
        </TableCell>
      </TableRow>
      <TransactionEditorActions
        showWarning={transactionEditor.state.showWarning}
        columnCount={transactionEditor.state.displayAccountField ? 7 : 6}
        mode={transactionEditor.state.mode}
        onSaveTransaction={transactionEditor.saveTransaction}
        onSaveAndAddAnotherTransaction={
          transactionEditor.saveAndAddAnotherTransaction
        }
        onCancel={transactionEditor.cancel}
      />
    </FormProvider>
  );
}
