import {
  useAddCategoryMutation,
  useAddTransactionMutation,
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { Input } from "@/core/components/uiLibrary/input";
import { DatePickerDemo } from "@/core/components/uiLibrary/datePicker";
import { AddCircleIcon } from "@/core/icons/icons";
import { z } from "zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoryT } from "@/core/types/NormalizedData";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/uiLibrary/form";
import { TableCell, TableRow } from "@/core/components/uiLibrary/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/uiLibrary/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { Button } from "@/core/components/uiLibrary/button";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { toggleManagePayees } from "@/core/slices/dialogSlice";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";
import { MdOutlineManageAccounts } from "react-icons/md";
import { ReactNode, useState } from "react";
import { Separator } from "@/pages/budget/account/components/Separator";
import {
  closeTransactionFormRow,
  transactionFormRow,
} from "@/pages/budget/account/slices/transactionFormRowSlice";
import clsx from "clsx";

const TransactionSchema = z.object({
  accountId: z.string().uuid(),
  date: z.date(),
  payeeId: z.string().nullish(),
  categoryName: z.string(),
  categoryId: z.string().optional(),
  memo: z.string(),
  outflow: z.string().optional(),
  inflow: z.string().optional(),
});

type Transaction = z.infer<typeof TransactionSchema>;

export function TransactionFormRow() {
  const { data } = useGetAccountsQuery();
  const dispatch = useAppDispatch();
  const [addTransaction] = useAddTransactionMutation();
  const { displayAccount, accountId, transactionId } =
    useAppSelector(transactionFormRow);
  const cancel = () => dispatch(closeTransactionFormRow());

  const transaction = transactionId
    ? data?.transactions[transactionId]
    : undefined;

  const form = useForm<Transaction>({
    defaultValues: {
      accountId: accountId,
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      payeeId: transaction?.payee || null,
      categoryName: transaction?.categoryId || "",
      categoryId: "",
      memo: transaction?.memo || "",
      outflow:
        transaction?.outflow !== undefined && transaction?.outflow !== null
          ? transaction.outflow === 0
            ? ""
            : transaction.outflow.toFixed(2)
          : "",
      inflow:
        transaction?.inflow !== undefined && transaction?.inflow !== null
          ? transaction.inflow === 0
            ? ""
            : transaction.inflow.toFixed(2)
          : "",
    },
    resolver: zodResolver(TransactionSchema),
  });

  const { register, getValues, reset } = form;

  const handleAddTransaction = () => {
    form.handleSubmit((data) => {
      addTransaction(data);
      cancel();
    })();
  };

  const handleSaveAndAddAnotherTransaction = () => {
    const newTransaction = getValues();
    addTransaction(newTransaction);
    reset();
  };

  return (
    <FormProvider {...form}>
      <TableRow className="bg-blue-700/20 hover:bg-blue-700/20 border-none">
        {displayAccount && (
          <TableCell>
            <SelectAccount />
          </TableCell>
        )}
        <TableCell>
          <DatePickerDemo />
        </TableCell>
        <TableCell>
          <SelectPayee />
        </TableCell>
        <TableCell>
          <SelectCategory />
        </TableCell>
        <TableCell>
          <Input
            className="h-5 py-0 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 overflow-ellipsis rounded-sm shadow-none"
            placeholder="Memo"
            {...register("memo")}
          />
        </TableCell>
        <TableCell>
          <Input
            className="h-5 py-0 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 overflow-ellipsis rounded-sm shadow-none"
            placeholder={"Outflow"}
            {...register("outflow")}
          />
        </TableCell>
        <TableCell>
          <Input
            className="h-5 py-0 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 overflow-ellipsis rounded-sm shadow-none"
            placeholder={"Inflow"}
            {...register("inflow")}
          />
        </TableCell>
      </TableRow>
      <TableRow className="bg-blue-700/20 hover:bg-blue-700/20">
        <TableCell colSpan={displayAccount ? 7 : 6}>
          <div className="flex justify-end gap-2">
            <Button
              onClick={cancel}
              className="h-5 w-[80px] py-3 rounded-sm bg-sky-700/10 text-sky-700 border border-sky-700 hover:bg-sky-700/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTransaction}
              type="submit"
              className="h-5 w-[80px] py-3 rounded-sm bg-sky-700 text-white hover:bg-sky-800"
            >
              Submit
            </Button>
            <Button
              onClick={handleSaveAndAddAnotherTransaction}
              className="h-5 py-3 rounded-sm px-4 bg-sky-700 text-white border border-sky-700 hover:bg-sky-800"
            >
              Save and add another
            </Button>
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
    (account) => account.type === "BANK",
  );

  const creditAccounts = Object.values(data.accounts).filter(
    (account) => account.type === "CREDIT_CARD",
  );

  const accountId = watch("accountId");

  const handleSelectAccount = (accountId: string) => {
    setValue("accountId", accountId);
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
                      account.id === accountId && "bg-gray-100",
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
                      account.id === accountId && "bg-gray-100",
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

/// SELECT PAYEE COMPONENTS

function SelectPayee() {
  const dispatch = useAppDispatch();
  const handleOpenDialog = () => dispatch(toggleManagePayees());

  return (
    <Popover>
      <PopoverTrigger className="w-full">
        <div className="flex items-center pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden">
          <input
            className="px-2 w-full caret-transparent rounded-sm text-ellipsis focus:outline-none focus:ring-0"
            placeholder="Payee"
          />
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] h-[200px] text-sm">
        <PopoverArrow className="w-8 h-2 fill-white" />
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="px-4 py-2 text-gray-700">
              <p>Saved Payees</p>
            </div>
            <Separator />
          </div>
          <div>
            <Separator />
            <div className="px-4 py-2 text-sky-950">
              <button
                onClick={handleOpenDialog}
                className="flex items-center gap-2"
              >
                <MdOutlineManageAccounts className="text-sky-950" />
                <span>Manage Payees</span>
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type SelectCategoryForm = {
  showAddCategoryForm: boolean;
  name: string;
  categoryGroupId: string;
};

//TODO: THIS NEEDS TO MATCH THE BACKEND / DATA ON FE
const AddCategorySchema = z.object({
  name: z.string().min(1, { message: "The category name is required." }),
  //TODO: z.string().uuid()
  categoryGroupId: z.string(),
});

// SELECT CATEGORY COMPONENTS

function SelectCategory() {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const { data } = useGetCategoriesQuery();
  const { months } = data;
  const { watch: watchContext, setValue: setValueContext } = useFormContext();
  const categoryName = watchContext("categoryName");

  const [createCategory, { isLoading, isSuccess }] = useAddCategoryMutation();

  const categories = data?.categories || {};
  const categoryGroupsOb = data?.categoryGroups || {};
  const categoryGroups = Object.values(categoryGroupsOb).filter((group) => group.name !== "Uncategorised");

  const extendableCategoryGroups = categoryGroups.filter((group) => group.name !== "Inflow");

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const form = useForm<SelectCategoryForm>({
    defaultValues: {
      showAddCategoryForm: false,
      name: "",
      categoryGroupId: "",
    },
    resolver: zodResolver(AddCategorySchema),
  });

  const { reset, control, handleSubmit, watch, setValue } = form;

  const handleSelectCategory = (
    categoryGroupName: string,
    category: CategoryT,
  ) => {
    setValueContext("categoryName", `${categoryGroupName}: ${category.name}`);
    setValueContext("categoryId", category.id);
    handleTogglePopover();
  };

  const showAddCategoryForm = watch("showAddCategoryForm");

  const toggleShowAddCategoryForm = () => {
    setValue("showAddCategoryForm", !showAddCategoryForm);
    if (showAddCategoryForm) reset();
  };

  const onSubmit = (category: z.infer<typeof AddCategorySchema>) => {
    createCategory(category);
  };

  const handleTogglePopover = () => {
    setPopoverVisible((prev) => !prev);
  };

  return (
    <Popover
      open={popoverVisible}
      modal={true}
      onOpenChange={(open) => {
        if (!open) reset();
      }}
    >
      <PopoverTrigger className="w-full">
        <div
          onClick={handleTogglePopover}
          className="flex items-center pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden"
        >
          <input
            readOnly
            className="px-2 w-full caret-transparent rounded-sm text-ellipsis focus:outline-none focus:ring-0"
            placeholder="Category"
            value={categoryName}
          />
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>
      <PopoverPortal>
        {showAddCategoryForm ? (
          <PopoverContent
            onPointerDownOutside={handleTogglePopover}
            className="w-[400px] overflow-scroll"
          >
            <PopoverArrow className="w-8 h-2 fill-white" />
            <div className="flex items-center gap-2 px-4 py-3">
              <button onClick={toggleShowAddCategoryForm}>
                <ChevronLeft className="size-4 text-sky-950" />
              </button>
              <p className="font-bold text-sky-950">Add Category</p>
            </div>
            <Separator />
            <div className="px-4 py-2">
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-950">
                          Category Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="focus-visible:ring-sky-700 shadow-none"
                            placeholder="New category name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-center" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="categoryGroupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-950">
                          In Category Group
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="focus:ring-sky-700 shadow-none">
                              <SelectValue placeholder="Choose a category group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {extendableCategoryGroups.map((categoryGroup) => (
                              <SelectItem value={categoryGroup.id}>
                                {categoryGroup.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={toggleShowAddCategoryForm}
                      className="w-[80px] bg-sky-700/10 text-sky-700 border border-sky-700 hover:bg-sky-700/30"
                    >
                      cancel
                    </Button>
                    <Button
                      type="submit"
                      className="w-[80px] bg-sky-700 text-white hover:bg-sky-800"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </PopoverContent>
        ) : (
          <PopoverContent
            avoidCollisions={false}
            onPointerDownOutside={handleTogglePopover}
            side={"bottom"}
            className="w-[400px] max-h-[300px] p-0 overflow-scroll shadow-lg text-sm"
          >
            <PopoverArrow className="w-8 h-2 fill-white" />
            <button
              onClick={toggleShowAddCategoryForm}
              className="px-4 py-3 flex items-center gap-2 text-sky-950"
            >
              <AddCircleIcon />
              <p>New Category</p>
            </button>
            <Separator />

            <div>
              <div className="py-2">
                {categoryGroups.map((categoryGroup) => (
                  <div key={categoryGroup.id}>
                    <CategoryGroup>{categoryGroup.name}</CategoryGroup>
                    {categoryGroup.categories.map((categoryId) => {
                      const category = categories[categoryId];

                      const monthsForCategory = category.months.map(
                        (monthId) => months[monthId],
                      );

                      const currentMonthObj = monthsForCategory.find((obj) => {
                        const date = new Date(obj.month);
                        return (
                          date.getFullYear() === currentYear &&
                          date.getMonth() === currentMonth
                        );
                      });

                      return (
                        <CategoryContainer
                          onClick={() => {
                            handleSelectCategory(categoryGroup.name, category);
                          }}
                        >
                          <Category>{category.name}</Category>
                          <CategoryAllocation
                            value={currentMonthObj.activity}
                          />
                        </CategoryContainer>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        )}
      </PopoverPortal>
    </Popover>
  );
}

function CategoryGroup({ children }: { children: ReactNode }) {
  return (
    <div className="px-4">
      <p className="font-bold">{children}</p>
    </div>
  );
}
function CategoryContainer({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex justify-between px-8 py-2 hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </button>
  );
}

function Category({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

function CategoryAllocation({ value }: { value: number }) {
  const textColor =
    value < 0 ? "text-red-400" : value > 0 ? "text-green-600" : "text-black ";
  return <p className={`${textColor} `}>£{value.toFixed(2)}</p>;
}
