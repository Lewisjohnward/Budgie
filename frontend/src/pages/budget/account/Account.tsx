import {
  ChevronDown,
  ChevronLeft,
  CirclePlus,
  Ellipsis,
  Pencil,
  X,
} from "lucide-react";
import { MdDelete } from "react-icons/md";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/core/components/uiLibrary/context-menu";
import { useParams } from "react-router-dom";
import {
  useAddCategoryMutation,
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useDuplicateTransactionsMutation,
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/uiLibrary/table";
import { Button } from "@/core/components/uiLibrary/button";
import { Input } from "@/core/components/uiLibrary/input";
import { DatePickerDemo } from "@/core/components/uiLibrary/datePicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";
import { AddCircleIcon } from "@/core/icons/icons";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/uiLibrary/select";
import { FaCopy, FaRegCreditCard, FaRegMoneyBillAlt } from "react-icons/fa";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import {
  toggleEditAccount,
  toggleManagePayees,
} from "@/core/slices/dialogSlice";
import { MdMoveToInbox, MdOutlineManageAccounts } from "react-icons/md";
import { numberToCurrency } from "@/core/lib/numberToCurrency";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/core/components/uiLibrary/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/core/components/uiLibrary/dropdown-menu";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import React from "react";

type Category = {
  id: string;
  userId: string;
  name: string;
  categoryGroupId: string;
};

type CategoryGroup = {
  id: string;
  userId: string;
  name: string;
};

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
  category: Category | null;
  categoryGroup: CategoryGroup | null;
};

export const columns = [
  {
    accessorFn: (row) => new Date(row.date),
    id: "date",
    header: "Date",
    cell: (info) => info.getValue<Date>().toLocaleDateString("en-GB"),
  },
  {
    accessorKey: "payee",
    header: "Payee",
    cell: (info) => info.getValue() ?? "",
  },
  {
    accessorFn: (row) => {
      if (row.categoryGroup?.name && row.category?.name) {
        return `${row.categoryGroup.name} : ${row.category.name}`;
      }
      return "Unassigned";
    },
    id: "category",
    header: "Category",
    cell: (info) => {
      const value = info.getValue();
      const isUnassigned = value === "Unassigned";
      return (
        <div title={value} className="truncate">
          <span
            className={
              isUnassigned ? "bg-yellow-300/70 px-2 py-[1px] rounded-lg" : ""
            }
          >
            {value}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "memo",
    header: "Memo",
    cell: (info) => {
      const value = info.getValue();
      return (
        <div className="truncate" title={value}>
          {value}
        </div>
      );
    },
  },
  {
    accessorKey: "outflow",
    id: "outflow",
    header: "Outflow",
    cell: (info) => {
      const value = info.getValue<number>();
      return value === 0 ? "" : `£${value.toFixed(2)}`;
    },
  },
  {
    accessorKey: "inflow",
    id: "inflow",
    header: "Inflow",
    cell: (info) => {
      const value = info.getValue<number>();
      return value === 0 ? "" : `£${value.toFixed(2)}`;
    },
  },
];

export function Account() {
  const { data, isLoading, isError } = useGetAccountsQuery();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [duplicateTransactions] = useDuplicateTransactionsMutation();
  const [addingTransaction, setAddingTransaction] = useState(false);
  const dispatch = useAppDispatch();
  const handleOpenDialog = () => dispatch(toggleEditAccount());
  const toggleAddTransaction = () => {
    setAddingTransaction((prev) => !prev);
  };

  if (isLoading) return <div>...loading</div>;
  if (isError) return <div>...error</div>;
  if (!data) return <div>There has been an error</div>;

  const { accountId } = useParams();

  if (!accountId) {
    throw new Error("There is no accountId");
  }

  if (isLoading) return <div>loading</div>;

  const chosenAccount = Object.values(data.accounts).find(
    ({ id }) => id === accountId,
  );

  if (!chosenAccount) {
    throw new Error(`Account with ID ${accountId} not found`);
  }

  const handleSubmitTransaction = async () => {
    const dummyTransaction = {
      accountId,
      // categoryId, doesn't need to be sent, by default will be this needs a category
      // date, default is today
      // inflow: 0.31,
      outflow: 5.69,
      // payee, not needed
      // TODO: FIX BUG BELOW
      // date: "2024-12-31", SENDING THIS will pass zod but fail db BUG!!!
      date: "2025-01-03T00:00:00.000Z",
      memo: "Sainsbury's hyper cheese bargs",
    };
  };

  const transactions = useMemo(
    () =>
      Object.values(data.transactions)
        .filter(({ accountId: id }) => id === accountId)
        .map((transaction) => {
          const category = data.categories[transaction.categoryId] ?? null;
          const categoryGroup = category
            ? (data.categoryGroups[category.categoryGroupId] ?? null)
            : null;
          return { ...transaction, category, categoryGroup };
        }),
    [data, accountId],
  );

  const account = {
    name: chosenAccount.name,
    type: chosenAccount.type,
    balance: chosenAccount.balance,
    // clearedBalance: 0,
    // unclearedBalance: 0,
    transactions,
    // transactions: formattedTransactions
  };

  ///// TABLE

  useEffect(() => {
    table.resetRowSelection();
    setAddingTransaction(false);
  }, [accountId]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [lastRowSelection, setLastRowSelection] = useState<RowSelectionState>(
    {},
  );

  console.log("row selected", rowSelection);
  const table = useReactTable({
    data: account.transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection, //hoist up the row selection state to your own scope
    // getRowId: (row) => row.id,
    state: {
      rowSelection, //pass the row selection state back to the table instance
    },
  });

  const onRowSelection = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    row,
  ) => {
    if (e.shiftKey) {
      const start = Number(Object.keys(lastRowSelection));
      const end = Number(row.id);
      const [min, max] = start < end ? [start, end] : [end, start];
      const selectedRows = Object.fromEntries(
        Array.from({ length: max - min + 1 }, (_, i) => [min + i, true]),
      );
      table.setRowSelection({ ...rowSelection, ...selectedRows });
    } else if (e.ctrlKey) {
      const id = row.id;
      table.setRowSelection((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    } else {
      table.resetRowSelection();
      row.toggleSelected();
    }
    setLastRowSelection({ [row.id]: true });
  };

  const onRowSelectionContextMenu = (row) => {
    if (!rowSelection[row.id]) {
      table.setRowSelection({ [row.id]: true });
      setLastRowSelection({ [row.id]: true });
    }
  };

  const hoverEnabled = !addingTransaction && !table.getIsSomeRowsSelected();

  const selectedRowIds = Object.keys(rowSelection).map(
    (key) => account.transactions[Number(key)].id,
  );

  const numberOfRows = Object.keys(rowSelection).length;
  const displaySelectionModal = numberOfRows > 0;
  const cancelSelection = () => setRowSelection({});

  const deleteSelectedTransactions = () => {
    deleteTransaction({ transactionIds: selectedRowIds });
    cancelSelection();
  };

  const handleDuplicateTransactions = () => {
    const rows = table.getRowModel().rows;
    const selectedRowIds = Object.keys(rowSelection).filter(
      (id) => rowSelection[id],
    );

    const transactionIds = rows
      .filter((row) => selectedRowIds.includes(row.id))
      .map((row) => row.original.id);

    duplicateTransactions({ transactionIds });
  };

  return (
    <div className="space-y-2 pt-4">
      <Container>
        <div className="flex justify-between">
          <div>
            <AccountName>{account.name}</AccountName>
            {account.type === "BANK" && <BankType />}
            {account.type === "CREDIT_CARD" && <CreditCardType />}
          </div>
          <Button
            onClick={handleOpenDialog}
            className="bg-blue-700/20 hover:bg-blue-700/30 shadow-none"
          >
            <Pencil className="text-blue-800" />
          </Button>
        </div>
      </Container>
      <Separator />
      <Container>
        <Balance balance={account.balance} />
      </Container>
      <Separator />
      <Container>
        <AddTransactionButton onClick={toggleAddTransaction} />
      </Container>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="relative border border-r-neutral-300 text-nowrap text-ellipsis overflow-hidden"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {addingTransaction && (
            <AddTransactionRow
              accountId={accountId}
              cancel={toggleAddTransaction}
            />
          )}
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) =>
              // row.getIsSelected() ? (
              false ? (
                <AddTransactionRow
                  accountId={accountId}
                  transactionId={row.original.id}
                  cancel={() => row.toggleSelected()}
                />
              ) : (
                <ContextMenu modal>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      // className={row.getIs ? "" : "hover:bg-transparent"}
                      onClick={(e) => onRowSelection(e, row)}
                      onContextMenu={() => onRowSelectionContextMenu(row)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64 text-gray-700">
                    <ContextMenuItem
                      onClick={deleteSelectedTransactions}
                      className="justify-start gap-4"
                    >
                      <MdDelete />
                      Delete
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={handleDuplicateTransactions}
                      className="justify-start gap-4"
                    >
                      <FaCopy />
                      Duplicate
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ),
            )
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <SelectionModal
        rowCount={numberOfRows}
        display={displaySelectionModal}
        cancel={cancelSelection}
      />
    </div>
  );
}

// COMPONENTS

function BankType() {
  return (
    <div className="flex items-center gap-[5px]">
      <FaRegMoneyBillAlt className="text-gray-600" />
      <p className="text-sm text-gray-600">Bank Account</p>
    </div>
  );
}

function CreditCardType() {
  return (
    <div className="flex items-center gap-[5px]">
      <FaRegCreditCard className="text-gray-600" />
      <p className="text-sm text-gray-600">Credit Card</p>
    </div>
  );
}

function Balance({ balance }: { balance: number }) {
  const color = balance > 0 ? "text-green-600" : "text-red-600";
  const formattedBalance = numberToCurrency(balance);

  return (
    <div>
      <p className={`${color} font-semibold`}>{formattedBalance}</p>
      <p className="text-gray-600">Balance</p>
    </div>
  );
}

function AccountName({ children }: { children: ReactNode }) {
  return <h1 className="font-bold text-2xl tracking-wide">{children}</h1>;
}

function Container({ children }: { children: ReactNode }) {
  return <div className="px-4 py-2">{children}</div>;
}

function Separator() {
  return <div className="h-[1px] bg-black/20" />;
}

function AddTransactionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="flex items-center gap-2 px-2 py-2 text-sky-950 border border-sky-950/40 rounded text-sm hover:bg-sky-950/10"
      onClick={onClick}
    >
      <CirclePlus size={15} />
      Add Transaction
    </button>
  );
}

/// TABLE COMPONENTS

function AddTransactionRow({
  accountId,
  cancel,
  transactionId,
}: {
  accountId: string;
  cancel: () => void;
  transactionId?: string;
}) {
  const [addTransaction] = useAddTransactionMutation();
  const { data } = useGetAccountsQuery();

  const transaction = transactionId
    ? data?.transactions[transactionId]
    : undefined;

  const TransactionSchema = z.object({
    accountId: z.string().uuid(),
    date: z.date(),
    payeeId: z.string().nullish(),
    categoryName: z.string(),
    categoryId: z.string().uuid(),
    memo: z.string(),
    outflow: z.string().optional(),
    inflow: z.string().optional(),
  });

  type Transaction = z.infer<typeof TransactionSchema>;

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
    resolver: zodResolver(AddCategorySchema),
  });

  const { register, getValues, setValue, watch, reset } = form;

  const handleAddTransaction = () => {
    const newTransaction = getValues();
    addTransaction(newTransaction);
    cancel();
  };

  const handleSaveAndAddAnotherTransaction = () => {
    const newTransaction = getValues();
    addTransaction(newTransaction);
    reset();
  };

  const categoryName = watch("categoryName");
  const setCategoryName = (name: string) => setValue("categoryName", name);
  const setCategoryId = (id: string) => setValue("categoryId", id);

  return (
    <FormProvider {...form}>
      <TableRow className="bg-blue-700/20 hover:bg-blue-700/20 border-none">
        <TableCell>
          <DatePickerDemo />
        </TableCell>
        <TableCell>
          <SelectPayee />
        </TableCell>
        <TableCell>
          <SelectCategory
            categoryName={categoryName}
            setCategoryName={setCategoryName}
            setCategoryId={setCategoryId}
          />
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
        <TableCell colSpan={6}>
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

function SelectCategory({
  categoryName,
  setCategoryName,
  setCategoryId,
}: {
  categoryName: string;
  setCategoryName: (name: string) => void;
  setCategoryId: (id: string) => void;
}) {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const { data } = useGetCategoriesQuery();
  const { months } = data;

  const [createCategory, { isLoading, isSuccess }] = useAddCategoryMutation();

  const categories = data?.categories || {};
  const categoryGroupsOb = data?.categoryGroups || {};
  const categoryGroups = Object.values(categoryGroupsOb);

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
    setCategoryName(`${categoryGroupName}: ${category.name}`);
    setCategoryId(category.id);
    handleOpenPopover();
  };

  const showAddCategoryForm = watch("showAddCategoryForm");

  const toggleShowAddCategoryForm = () => {
    setValue("showAddCategoryForm", !showAddCategoryForm);
    if (showAddCategoryForm) reset();
  };

  const onSubmit = (category: z.infer<typeof AddCategorySchema>) => {
    createCategory(category);
  };

  const handleOpenPopover = () => {
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
          onClick={handleOpenPopover}
          className="flex items-center pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden"
        >
          <input
            className="px-2 w-full caret-transparent rounded-sm text-ellipsis focus:outline-none focus:ring-0"
            placeholder="Category"
            value={categoryName}
            readOnly
          />
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>
      <PopoverPortal>
        {showAddCategoryForm ? (
          <PopoverContent
            onPointerDownOutside={handleOpenPopover}
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
                            {categoryGroups.map((categoryGroup) => (
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
            onPointerDownOutside={handleOpenPopover}
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

// function Separator() {
//   return <div className="h-[1px] bg-gray-400/50"></div>;
// }

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

/// SELECTION MODAL

function SelectionModal({
  rowCount,
  display,
  cancel,
}: {
  rowCount: number;
  display: boolean;
  cancel: () => void;
}) {
  const { data } = useGetCategoriesQuery();
  if (!data) return <div>There has been an error</div>;

  const categoryGroups = Object.values(data.categoryGroups);
  const categories = data.categories;

  return (
    <Dialog open={display} modal={false}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-fit flex items-center px-2 h-12 bg-sky-950 border-none rounded-xl text-white shadow-none [&>button:last-child]:hidden"
        position={"bc"}
      >
        <DialogTitle className="sr-only">Row selection modal</DialogTitle>
        <Button
          onClick={cancel}
          className="bg-transparent hover:bg-white/10 focus-visible:ring-white"
        >
          <X />
          {`${rowCount} Transactions`}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-transparent hover:bg-white/10 focus-visible:ring-white">
              <MdMoveToInbox />
              Categorise
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuArrow className="fill-white" width={10} height={10} />
            {categoryGroups.map((categoryGroup) => {
              return (
                <DropdownMenuGroup>
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>{categoryGroup.name}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {categoryGroup.categories.map((categoryId) => (
                            <DropdownMenuItem>
                              <span>{categories[categoryId].name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                </DropdownMenuGroup>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-transparent hover:bg-white/10 focus-visible:ring-white">
              <Ellipsis />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {categoryGroups.map((categoryGroup) => {
              return (
                <DropdownMenuGroup>
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>{categoryGroup.name}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal></DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                </DropdownMenuGroup>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </DialogContent>
    </Dialog>
  );
}
