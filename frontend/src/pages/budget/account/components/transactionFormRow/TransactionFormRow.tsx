import { useGetAccountsQuery } from "@/core/api/budgetApiSlice";
import { Input } from "@/core/components/uiLibrary/input";
import { DatePickerDemo } from "@/core/components/uiLibrary/datePicker";
import { z } from "zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TableCell, TableRow } from "@/core/components/uiLibrary/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { ChevronDown } from "lucide-react";
import { PopoverArrow } from "@radix-ui/react-popover";
import { useState } from "react";
import clsx from "clsx";
import { TransactionFormManager } from "../../hooks/useAccount";
import { TransactionFormMode } from "../../hooks/useTransactionFormRow";
import { SelectPayee } from "./selectPayee";
import { SelectCategory } from "./selectCategory";
import { Separator } from "../Separator";
import { Button } from "@/core/components/uiLibrary/button";
import { SelectDate } from "./selectDate/SelectDate";

type TransactionFormRowProps = {
  transactionForm: TransactionFormManager;
};

export function TransactionFormRow({
  transactionForm,
}: TransactionFormRowProps) {
  const { register } = transactionForm.form;

  return (
    <FormProvider {...transactionForm.form}>
      <TableRow
        aria-label="Add transaction form"
        onFocus={transactionForm.resetWarning}
        className={
          transactionForm.state.showWarning
            ? "bg-green-500/30 hover:bg-green-500/30 border-none"
            : "bg-blue-700/20 hover:bg-blue-700/20 border-none"
        }
        onClick={transactionForm.onClick}
      >
        {transactionForm.state.displayAccountField && (
          <TableCell>
            <SelectAccount />
          </TableCell>
        )}
        <TableCell>
          <SelectDate selectDate={transactionForm.selectDate} />
        </TableCell>
        <TableCell>
          <SelectPayee selectPayee={transactionForm.selectPayee} />
        </TableCell>
        <TableCell>
          <SelectCategory selectCategory={transactionForm.selectCategory} />
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
      <TableRow
        className={
          transactionForm.state.showWarning
            ? "bg-green-500/30 hover:bg-green-500/30"
            : "bg-blue-700/20 hover:bg-blue-700/20"
        }
        onClick={transactionForm.onClick}
      >
        <TableCell colSpan={transactionForm.state.displayAccountField ? 7 : 6}>
          <div
            className="flex justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              onClick={transactionForm.close}
              className="h-5 w-[80px] py-3 rounded-sm bg-sky-700/10 text-sky-700 border border-sky-700 hover:bg-sky-700/30"
            >
              Cancel
            </Button>
            {transactionForm.state.mode === TransactionFormMode.Edit ? (
              <Button
                onClick={transactionForm.handleSaveTransaction}
                className="h-5 py-3 rounded-sm px-4 bg-sky-700 text-white border border-sky-700 hover:bg-sky-800"
              >
                Save
              </Button>
            ) : (
              <>
                <Button
                  onClick={transactionForm.handleSaveTransaction}
                  type="submit"
                  className="h-5 w-[80px] py-3 rounded-sm bg-sky-700 text-white hover:bg-sky-800"
                >
                  Submit
                </Button>
                <Button
                  onClick={transactionForm.handleSaveAndAddAnother}
                  className="h-5 py-3 rounded-sm px-4 bg-sky-700 text-white border border-sky-700 hover:bg-sky-800"
                >
                  Save and add another
                </Button>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    </FormProvider>
  );
}

function SelectAccount() {
  const { data } = useGetAccountsQuery();
  const { setValue, watch } = useFormContext();

  if (!data) return <div>There has been an error</div>;

  const cashAccounts = Object.values(data.accounts).filter(
    (account) => account.type === "BANK"
  );

  const creditAccounts = Object.values(data.accounts).filter(
    (account) => account.type === "CREDIT_CARD"
  );

  const accountId = watch("accountId");

  const handleSelectAccount = (accountId: string) => {
    setValue("accountId", accountId, { shouldDirty: true });
  };

  return (
    <Popover>
      <PopoverTrigger className="w-full">
        <div className="flex items-center pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden">
          <input
            readOnly
            className="px-2 w-full caret-transparent rounded-sm text-ellipsis focus:outline-none focus:ring-0"
            value={data.accounts[accountId]?.name || "Account"}
          />
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] h-[200px] text-sm">
        <PopoverArrow className="w-8 h-2 fill-white" />
        <div className="h-full flex flex-col justify-between">
          <div className="py-2 text-gray-700">
            {cashAccounts.length > 0 && (
              <>
                <p className="px-4 py-2 font-bold text-sm">Cash Accounts</p>
                {cashAccounts.map((account) => (
                  <button
                    key={account.id}
                    className={clsx(
                      "flex w-full px-4 py-2 hover:bg-gray-100 cursor-pointer",
                      account.id === accountId && "bg-gray-100"
                    )}
                    onClick={() => handleSelectAccount(account.id)}
                  >
                    {account.name}
                  </button>
                ))}
              </>
            )}
            {creditAccounts.length > 0 && (
              <>
                <p className="px-4 py-2 font-bold text-sm">Credit Accounts</p>
                {creditAccounts.map((account) => (
                  <button
                    key={account.id}
                    className={clsx(
                      "flex w-full px-4 py-2 hover:bg-gray-100 cursor-pointer",
                      account.id === accountId && "bg-gray-100"
                    )}
                    onClick={() => handleSelectAccount(account.id)}
                  >
                    {account.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
