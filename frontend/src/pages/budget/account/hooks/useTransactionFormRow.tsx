import { useEffect, useRef, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAddTransactionMutation,
  useEditTransactionMutation,
} from "@/core/api/budgetApiSlice";
import { useSelectCategory } from "../components/transactionFormRow/selectCategory/useSelectCategory";
import { useSelectPayee } from "../components/transactionFormRow/selectPayee/useSelectPayee";
import { CategoryT } from "@/core/types/NormalizedData";
import { useSelectDate } from "../components/transactionFormRow/selectDate/useSelectDate";

const TransactionFormSchema = z.object({
  accountId: z.string().uuid(),
  date: z.date(),
  payeeId: z.string().nullish(),
  categoryName: z.string(),
  categoryId: z.string().optional(),
  memo: z.string(),
  outflow: z.string().optional(),
  inflow: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof TransactionFormSchema>;

export type TransactionForm = UseFormReturn<TransactionFormData>;

export enum TransactionFormMode {
  Add = "add",
  Edit = "edit",
}

const dateStringSchema = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{2,4}$/, "Invalid date format (dd/mm/yy)")
  .refine((val) => {
    const match = val.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
    if (!match) return false;

    const [, day, month, year] = match;
    const fullYear = year.length === 2 ? `20${year}` : year;
    const date = new Date(
      parseInt(fullYear),
      parseInt(month) - 1,
      parseInt(day)
    );

    return (
      date.getDate() === parseInt(day) &&
      date.getMonth() === parseInt(month) - 1 &&
      date.getFullYear() === parseInt(fullYear)
    );
  }, "Invalid date");

export type TransactionFormState = {
  open: boolean;
  mode: TransactionFormMode;
  displayAccountField: boolean;
  accountId: string | undefined;
  transactionId?: string;
  showWarning: boolean;
  editingRowIndex?: number;
};

export const useTransactionFormRow = (accountId: string) => {
  const [addTransactionState, setAddtransactionState] =
    useState<TransactionFormState>({
      open: false,
      mode: TransactionFormMode.Add,
      displayAccountField: false,
      accountId: "",
      showWarning: false,
      editingRowIndex: undefined,
    });

  const transactionForm: TransactionForm = useForm<TransactionFormData>({
    defaultValues: {
      accountId: accountId,
      date: new Date(),
      payeeId: null,
      categoryName: "",
      categoryId: "",
      memo: "",
      outflow: "",
      inflow: "",
    },
    resolver: zodResolver(TransactionFormSchema),
  });
  const { setValue } = transactionForm;
  const { isDirty } = transactionForm.formState;

  const [addTransaction] = useAddTransactionMutation();
  const [editTransaction] = useEditTransactionMutation();
  const selectDate = useSelectDate();
  const selectPayee = useSelectPayee();
  const selectCategory = useSelectCategory();

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) {
      setValue("date", date, { shouldDirty: true });
      return;
    }
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    setValue("date", utcDate, { shouldDirty: true });
    selectDate.onSelect(
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    );
    selectDate.popover.close();
    selectPayee.focus();
  };

  const handleInputChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    // if date is invalid update input but don't update form
    const value = e.target.value;
    selectDate.setInput(value);

    const result = dateStringSchema.safeParse(value);
    if (result.success) {
      // Convert to Date object
      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
      const [, day, month, year] = match!;

      // Only accept 2-digit years
      if (year.length !== 2) {
        return;
      }

      const fullYear = `20${year}`;
      const date = new Date(
        parseInt(fullYear),
        parseInt(month) - 1,
        parseInt(day)
      );

      // Check if date is more than 5 years old
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      if (date < fiveYearsAgo) {
        return;
      }

      setValue("date", date, { shouldDirty: true });
    }
  };

  const handleSelectPayee = (item: {
    name: string;
    id: string;
    type: "payee" | "account";
  }) => {
    // if (item.type === "account") {
    //   console.log("disable category");
    // }
    // dispatchReducer({
    //   type: "SELECT",
    //   input: item.name,
    // });
    selectPayee.popover.close();
    selectCategory.focus();
  };

  const handleSelectCategory = (
    categoryGroupName: string,
    category: CategoryT
  ) => {
    // TODO:(lewis 2025-12-05 13:53) if user doesn't add category then just give uncategorised
    if (!categoryGroupName || !category) {
      selectCategory.popover.handleClose();
      transactionForm.setFocus("memo");
    }

    // TODO:(lewis 2025-12-05 11:49) this is moaning because it expects a HTMLINPUT event this needs sorting out
    const value = `${categoryGroupName}: ${category.name}`;
    selectCategory.handleSelect(value);
    // const e = { target: { value: `${categoryGroupName}: ${category.name}` } };
    // selectCategory.handleInputChange(e);

    transactionForm.setValue(
      "categoryName",
      `${categoryGroupName}: ${category.name}`,
      { shouldDirty: true }
    );
    transactionForm.setValue("categoryId", category.id, { shouldDirty: true });
    selectCategory.popover.handleClose();
    transactionForm.setFocus("memo");
    // Future: Add cross-control logic here if needed
  };

  // when user is inputing text reset transaction form
  const handleInputChangeCategory = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // don't reset form on input change, only when user focuses next input should it reset
    // transactionForm.setValue("categoryName", ``, { shouldDirty: true });
    // transactionForm.setValue("categoryId", "", { shouldDirty: true });
    selectCategory.handleInputChange(e);
  };

  const handleBlurCategory = () => {
    const selection = selectCategory.getHighlightedSelection();
    if (selection) {
      transactionForm.setValue("categoryId", selection.category.id, {
        shouldDirty: true,
      });
    }
    // Let the hook's blur handle input value update and popover close
    selectCategory.handleBlur();
  };

  useEffect(() => {
    if (
      addTransactionState.open &&
      addTransactionState.mode === TransactionFormMode.Add
    ) {
      selectDate.focus();
    }
  }, [addTransactionState.open]);

  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  const resetWarning = () => {
    setAddtransactionState((prev) => ({
      ...prev,
      showWarning: false,
    }));
    // Clear any existing timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  };

  // this should not be here - maybe should expose a warning function to call?
  const handleTableInteraction = () => {
    if (isDirty) {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }

      setAddtransactionState((prev) => ({
        ...prev,
        showWarning: true,
      }));

      setTimeout(() => {
        setAddtransactionState((prev) => ({
          ...prev,
          showWarning: false,
        }));
      }, 200);

      setTimeout(() => {
        setAddtransactionState((prev) => ({
          ...prev,
          showWarning: true,
        }));
      }, 400);

      warningTimeoutRef.current = setTimeout(() => {
        setAddtransactionState((prev) => ({
          ...prev,
          showWarning: false,
        }));
        warningTimeoutRef.current = null;
      }, 600);
    } else {
      setAddtransactionState({
        open: false,
        mode: TransactionFormMode.Add,
        displayAccountField: false,
        accountId: "",
        showWarning: false,
        editingRowIndex: undefined,
      });
    }
  };

  const handleSaveTransaction = () => {
    const formValues = transactionForm.getValues();
    if (addTransactionState.mode === TransactionFormMode.Edit) {
      console.log("edit transaction", formValues);

      editTransaction([
        {
          id: addTransactionState.transactionId,
          accountId: formValues.accountId,
          categoryId: formValues.categoryId || "",
          payeeId: formValues.payeeId ? formValues.payeeId : undefined,
          memo: formValues.memo || null,
          date: formValues.date.toISOString(),
          inflow: formValues.inflow || "0",
          outflow: formValues.outflow || "0",
          cleared: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } else {
      console.log(transactionForm.getValues());
      addTransaction({
        id: addTransactionState.transactionId,
        accountId: formValues.accountId,
        categoryId: formValues.categoryId || undefined,
        payeeId: formValues.payeeId ? formValues.payeeId : undefined,
        memo: formValues.memo,
        date: formValues.date.toISOString(),
        inflow: formValues.inflow || undefined,
        outflow: formValues.outflow || undefined,
        cleared: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    transactionForm.reset();
    closeAddTransactionForm();
  };

  // handle and add another transaction
  const handleSaveAndAddAnotherTransaction = () => {
    transactionForm.handleSubmit((data: TransactionFormData) => {
      addTransaction({
        id: addTransactionState.transactionId,
        accountId: data.accountId,
        categoryId: data.categoryId || "",
        payeeId: data.payeeId ? data.payeeId : undefined,
        memo: data.memo || null,
        date: data.date.toISOString(),
        inflow: data.inflow || "0",
        outflow: data.outflow || "0",
        cleared: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    })();
    transactionForm.reset();
  };

  const handleFormRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const closeAddTransactionForm = () => {
    transactionForm.reset();
    selectDate.reset();
    selectCategory.reset();

    setAddtransactionState({
      open: false,
      mode: TransactionFormMode.Add,
      displayAccountField: false,
      accountId: "",
      showWarning: false,
      editingRowIndex: undefined,
    });
  };

  // TODO:(lewis 2025-12-03 13:30) replace this with a function that creates default data
  const resetToNewTransaction = () => {
    transactionForm.reset({
      accountId: accountId,
      date: new Date(),
      payeeId: null,
      categoryName: "",
      categoryId: "",
      memo: "",
      outflow: "",
      inflow: "",
    });
  };

  const loadTransactionForEdit = (transaction: any, txId: number) => {
    // Reset form with transaction data
    transactionForm.reset({
      accountId: transaction.accountId,
      date: new Date(transaction.date),
      payeeId: transaction.payee || null,
      categoryName: transaction.unassigned
        ? ""
        : `${transaction.categoryGroup.name}: ${transaction.category.name}` ||
        "",
      categoryId: transaction.categoryId || "",
      memo: transaction.memo || "",
      outflow:
        transaction.outflow !== undefined && transaction.outflow !== null
          ? transaction.outflow === 0
            ? ""
            : transaction.outflow.toFixed(2)
          : "",
      inflow:
        transaction.inflow !== undefined && transaction.inflow !== null
          ? transaction.inflow === 0
            ? ""
            : transaction.inflow.toFixed(2)
          : "",
    });

    // Open the form with the transaction ID
    // TODO: this needs to be renamed because its for edit here
    setAddtransactionState({
      open: true,
      mode: TransactionFormMode.Edit,
      displayAccountField: accountId === "all",
      accountId: accountId,
      transactionId: transaction.id,
      showWarning: false,
      editingRowIndex: txId,
    });
  };
  return {
    form: transactionForm,
    addTransactionState,
    setAddtransactionState,
    closeAddTransactionForm,
    handleSaveTransaction,
    handleSaveAndAddAnotherTransaction,
    handleFormRowClick,
    handleTableInteraction,
    resetWarning,
    isDirty,
    loadTransactionForEdit,
    resetToNewTransaction,
    selectDate: {
      ...selectDate,
      onChange: handleInputChangeDate,
      select: handleSelectDate,
    },
    selectPayee: {
      ...selectPayee,
      select: handleSelectPayee,
    },
    selectCategory: {
      ...selectCategory,
      handleInputChange: handleInputChangeCategory,
      handleSelect: handleSelectCategory,
      handleBlur: handleBlurCategory,
    },
  };
};
// useTransactionFormRow.ts
// export const useTransactionFormRow = () => {
//   const form = useFormContext();
//
//   // Compose the two feature hooks
//   const category = useSelectCategory();
//   const payee = useSelectPayee();
//
//   // Orchestrate cross-control behavior
//   const handleSelect = (item: { name: string; id: string; type: 'payee' | 'account' }) => {
//     // update form
//     if (item.type === 'payee') {
//       form.setValue('payeeName', item.name, { shouldDirty: true });
//       form.setValue('payeeId', item.id || null, { shouldDirty: true });
//     } else {
//       // account transfer
//       form.setValue('payeeName', `To/From ${item.name}`, { shouldDirty: true });
//       form.setValue('payeeId', item.id || null, { shouldDirty: true });
//       // coordination: disable/reset category
//       form.setValue('categoryId', null, { shouldDirty: true });
//     }
//
//     // popovers: close appropriately
//     payee.popover.handleClose();
//   };
//
//   // Expose the two models as sub-objects
//   return {
//     category, // as returned from useSelectCategory (e.g., addCategory, currentMonthByCategoryId, popover, etc.)
//     payee: {
//       ...payee,
//       handleSelect, // normalized handler for payee/account clicks
//     },
//   };
// };
//   Standardize popovers (once)
// Extract a ComboboxPopover wrapper that bakes in:
// PopoverTrigger asChild
// onOpenAutoFocus={e => e.preventDefault()}
// Close on Tab/Escape, ARIA roles, roving index, virtualization hook
// Reuse it for payee and category. You’ll stop fixing the same edge cases twice.

//   Unify keyboard + focus logic
// Create useTransactionFormRow to own field order and focusNextFrom(). Wire payee/category/date “commit → close popover → focus next”.
// Add a HotkeysProvider with scopes (global, account, transactionRow, popover). Replace ad‑hoc window listeners in
// Account.tsx
// .

type TransactionFormRow = ReturnType<typeof useTransactionFormRow>;
export type SelectDateModel = TransactionFormRow["selectDate"];
