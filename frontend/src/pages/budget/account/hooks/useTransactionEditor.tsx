import { useEffect, useRef, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CategoryBranded,
  useSelectCategory,
} from "../components/transactionEditorRow/selectCategory/useSelectCategory";
import { useSelectPayee } from "../components/transactionEditorRow/selectPayee/useSelectPayee";
import { useSelectDate } from "../components/transactionEditorRow/selectDate/useSelectDate";
import { normaliseDate } from "../utils/normaliseDate";
import {
  useCreateTransactionMutation,
  useEditTransactionMutation,
} from "@/core/api/budget/transaction/transactionApiSlice";
import {
  asAccountId,
  asCategoryId,
  asPayeeId,
} from "../../allocation/types/types";

const TransactionFormSchema = z.object({
  // TODO:(lewis 2026-10-27 11:07) need to decide if this is a good idea or not, a hook refactor will probably answer the question
  accountId: z.string().min(1, "Account ID is required"),
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

export enum TransactionEditorMode {
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

export type TransactionEditorState = {
  open: boolean;
  mode: TransactionEditorMode;
  displayAccountField: boolean;
  accountId: string | undefined;
  transactionId?: string;
  showWarning: boolean;
  editingTransactionId?: string;
};

const defaultTransactionEditorState = {
  open: false,
  mode: TransactionEditorMode.Add,
  displayAccountField: false,
  accountId: "",
  showWarning: false,
  editingTransactionId: undefined,
};

export const useTransactionEditor = (accountId: string) => {
  const [createTransaction] = useCreateTransactionMutation();
  const [editTransaction] = useEditTransactionMutation();
  const [transactionEditorState, setTransactionEditorState] =
    useState<TransactionEditorState>(defaultTransactionEditorState);

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

  const selectDate = useSelectDate();
  const selectPayee = useSelectPayee();
  const selectCategory = useSelectCategory();

  const handleSelectDate = () => {
    selectDate.popover.close();
    selectCategory.focus();
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

  const handleSelectPayee = (_: {
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
    category: CategoryBranded
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
      transactionEditorState.open &&
      transactionEditorState.mode === TransactionEditorMode.Add
    ) {
      selectDate.focus();
    }
  }, [transactionEditorState.open]);

  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  const resetWarning = () => {
    setTransactionEditorState((prev) => ({
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

      setTransactionEditorState((prev) => ({
        ...prev,
        showWarning: true,
      }));

      setTimeout(() => {
        setTransactionEditorState((prev) => ({
          ...prev,
          showWarning: false,
        }));
      }, 200);

      setTimeout(() => {
        setTransactionEditorState((prev) => ({
          ...prev,
          showWarning: true,
        }));
      }, 400);

      warningTimeoutRef.current = setTimeout(() => {
        setTransactionEditorState((prev) => ({
          ...prev,
          showWarning: false,
        }));
        warningTimeoutRef.current = null;
      }, 600);
    } else {
      setTransactionEditorState({
        open: false,
        mode: TransactionEditorMode.Add,
        displayAccountField: false,
        accountId: "",
        showWarning: false,
        editingTransactionId: undefined,
      });
    }
  };

  const saveTransaction = () => {
    const formValues = transactionForm.getValues();
    if (transactionEditorState.mode === TransactionEditorMode.Edit) {
      console.log("edit transaction", formValues);

      editTransaction([
        {
          id: transactionEditorState.transactionId,
          accountId: formValues.accountId,
          categoryId: formValues.categoryId || "",
          payeeId: formValues.payeeId ? formValues.payeeId : undefined,
          memo: formValues.memo || null,
          date: normaliseDate(formValues.date).toISOString(),
          inflow: formValues.inflow || "0",
          outflow: formValues.outflow || "0",
        },
      ]);
    } else {
      createTransaction({
        accountId: asAccountId(formValues.accountId),
        categoryId: formValues.categoryId
          ? asCategoryId(formValues.categoryId)
          : undefined,
        payeeId: formValues.payeeId ? asPayeeId(formValues.payeeId) : undefined,
        memo: formValues.memo,
        date: normaliseDate(formValues.date).toISOString(),
        inflow: formValues.inflow || undefined,
        outflow: formValues.outflow || undefined,
      });
    }
    transactionForm.reset();
    cancel();
  };

  // handle and add another transaction
  const saveAndAddAnotherTransaction = () => {
    transactionForm.handleSubmit((data: TransactionFormData) => {
      createTransaction({
        accountId: asAccountId(data.accountId),
        categoryId: data.categoryId ? asCategoryId(data.categoryId) : undefined,
        payeeId: data.payeeId ? asPayeeId(data.payeeId) : undefined,
        memo: data.memo || undefined,
        date: normaliseDate(data.date).toISOString(),
        inflow: data.inflow || undefined,
        outflow: data.outflow || undefined,
      });
    })();

    transactionForm.reset();
  };

  const open = () => {
    resetToNewTransaction();
    setTransactionEditorState({
      open: true,
      mode: TransactionEditorMode.Add,
      displayAccountField: accountId === "all",
      accountId: accountId || "",
      showWarning: false,
      editingTransactionId: undefined,
    });
  };

  const cancel = () => {
    transactionForm.reset();
    selectDate.reset();
    selectCategory.reset();

    setTransactionEditorState(defaultTransactionEditorState);
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

  const loadTransactionForEdit = (transaction: any, txId: string) => {
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
    setTransactionEditorState({
      open: true,
      mode: TransactionEditorMode.Edit,
      displayAccountField: accountId === "all",
      accountId: accountId,
      transactionId: transaction.id,
      showWarning: false,
      editingTransactionId: txId,
    });
  };
  return {
    form: transactionForm,
    transactionEditorState,
    setTransactionEditorState,
    open,
    cancel,
    saveTransaction,
    saveAndAddAnotherTransaction,
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

//   Unify keyboard + focus logic
// Create useTransactionFormRow to own field order and focusNextFrom(). Wire payee/category/date “commit → close popover → focus next”.
// Add a HotkeysProvider with scopes (global, account, transactionRow, popover). Replace ad‑hoc window listeners in
// Account.tsx
// .

type TransactionEditor = ReturnType<typeof useTransactionEditor>;
export type SelectDateModel = TransactionEditor["selectDate"];
export type SelectCategoryModel = TransactionEditor["selectCategory"];
