import { ChevronDown, ChevronLeft, CirclePlus } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  useAddCategoryMutation,
  useAddTransactionMutation,
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { ReactNode, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
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
import { cn } from "@/core/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
      let category = "Unassigned";
      if (row.categoryGroup?.name && row.category?.name) {
        category = `${row.categoryGroup.name} : ${row.category.name}`;
      }
      return category;
    },
    id: "category",
    header: "Category",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "memo",
    header: "Memo",
  },
  {
    accessorFn: (row) => row.outflow ?? 0,
    id: "outflow",
    header: "Outflow",
    cell: (info) => `£${info.getValue<number>().toFixed(2)}`,
  },
  {
    accessorFn: (row) => row.inflow ?? 0,
    id: "inflow",
    header: "Inflow",
    cell: (info) => `£${info.getValue<number>().toFixed(2)}`,
  },
];

export function Account() {
  // TODO: GET TRANSACTION DATA
  const { data, isLoading, isError } = useGetAccountsQuery();
  const [addTransaction] = useAddTransactionMutation();
  const [addingTransaction, setAddingTransaction] = useState(false);
  const toggleAddTransaction = () => {
    setAddingTransaction((prev) => !prev);
  };

  if (isLoading) return <div>...loading</div>;
  if (isError) return <div>...error</div>;
  if (!data) return <div>There has been an error</div>;

  const { accountId } = useParams();

  if (isLoading) return <div>loading</div>;

  const chosenAccount = Object.values(data.accounts).find(
    ({ id }) => id === accountId,
  );

  if (!chosenAccount) {
    throw new Error(`Account with ID ${accountId} not found`);
  }

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
    [data],
  );

  const account = {
    name: chosenAccount.name,
    balance: chosenAccount.balance,
    // clearedBalance: 0,
    // unclearedBalance: 0,
    transactions,
    // transactions: formattedTransactions
  };

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

  const table = useReactTable({
    data: account.transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-2 pt-4">
      <Container>
        <AccountName>{account.name}</AccountName>
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
              accountId={accountId!}
              cancel={toggleAddTransaction}
            />
          )}
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// COMPONENTS
function Balance({ balance }: { balance: number }) {
  const color = balance > 0 ? "text-green-600" : "text-red-600";
  const formattedBalance = balance.toFixed(2);

  return (
    <div>
      <p className={`${color} font-semibold`}>£{formattedBalance}</p>
      <p className="text-gray-600">Balance</p>
    </div>
  );
}

function AccountName({ children }: { children: ReactNode }) {
  return <h1 className="font-bold text-2xl tracking-tight">{children}</h1>;
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
}: {
  accountId: string;
  cancel: () => void;
}) {
  const [addTransaction] = useAddTransactionMutation();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [payee, setPayee] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [memo, setMemo] = useState("");
  const [outflow, setOutflow] = useState("");
  const [inflow, setInflow] = useState("");

  const handleAddTransaction = () => {
    const transaction = {
      accountId,
      date,
      payee,
      categoryId,
      memo,
      outflow,
      inflow,
    };

    addTransaction(transaction);
    cancel();
  };

  return (
    <>
      <TableRow className="bg-blue-700/5 hover:bg-blue-700/5 border-none">
        <TableCell>
          <DatePickerDemo date={date} setDate={setDate} />
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
          <InputOutline placeholder={"Memo"} value={memo} setValue={setMemo} />
        </TableCell>
        <TableCell>
          <InputOutline
            placeholder={"Outflow"}
            value={outflow}
            setValue={setOutflow}
            disabled={inflow.length > 0}
          />
        </TableCell>
        <TableCell>
          <InputOutline
            placeholder={"Inflow"}
            value={inflow}
            setValue={setInflow}
            disabled={outflow.length > 0}
          />
        </TableCell>
      </TableRow>
      <TableRow className="bg-blue-700/5 hover:bg-blue-700/5">
        <TableCell colSpan={6}>
          <div className="flex justify-end gap-2">
            <Button
              onClick={cancel}
              className="w-[80px] bg-sky-700/10 text-sky-700 border border-sky-700 hover:bg-sky-700/30"
            >
              cancel
            </Button>
            <Button
              onClick={handleAddTransaction}
              type="submit"
              className="w-[80px] bg-sky-700 text-white hover:bg-sky-800"
            >
              Submit
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

interface InputOutlineProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  setValue: (value: string) => void;
}

function InputOutline({
  value,
  setValue,
  disabled,
  className,
  ...props
}: InputOutlineProps) {
  return (
    <Input
      className={cn(
        "h-5 py-0 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 overflow-ellipsis rounded-sm shadow-none",
        className,
      )}
      disabled={disabled}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      {...props}
    />
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
  const [createCategory, { isLoading, isSuccess }] = useAddCategoryMutation();

  const categories = data?.categories || {};
  const categoryGroupsOb = data?.categoryGroups || {};
  const categoryGroups = Object.values(categoryGroupsOb);

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

                      return (
                        <CategoryContainer
                          onClick={() => {
                            handleSelectCategory(categoryGroup.name, category);
                          }}
                        >
                          <Category>{category.name}</Category>
                          <CategoryAllocation value={50} />
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
              <button>Manage Payees</button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
