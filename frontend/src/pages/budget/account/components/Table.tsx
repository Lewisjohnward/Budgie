import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/uiLibrary/table";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Copy, MoveRight, Trash2 } from "lucide-react";
import { Button } from "@/core/components/uiLibrary/button";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/core/components/uiLibrary/context-menu";
import {
  useDeleteTransactionMutation,
  useEditTransactionMutation,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { toast } from "sonner";
import { DatePickerDemo } from "@/core/components/uiLibrary/datePicker";
import { Input } from "@/core/components/uiLibrary/input";
import { CategoryT, Transaction } from "@/core/types/NormalizedData";
import { Popover, PopoverContent } from "@/core/components/uiLibrary/popover";
import {
  PopoverArrow,
  PopoverPortal,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { AddCircleIcon, AddIcon } from "@/core/icons/icons";
import { cn } from "@/core/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/uiLibrary/form";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/uiLibrary/select";
import { z } from "zod";

type TableProps = {
  transactions: Transaction[];
  addingTransaction: boolean;
};

const generateColumns = (
  editingRow: number | null,
): ColumnDef<Transaction>[] => {
  return [
    // {
    //   id: "select",
    //   enableResizing: false,
    //   size: 40,
    //   header: ({ table }) => (
    //     <div className="flex items-center ">
    //       <Checkbox
    //         checked={
    //           table.getIsAllPageRowsSelected() ||
    //           (table.getIsSomePageRowsSelected() && "indeterminate")
    //         }
    //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //         aria-label="Select all"
    //       />
    //     </div>
    //   ),
    //   cell: ({ row }) => (
    //     <div className="flex items-center">
    //       <Checkbox
    //         checked={row.getIsSelected()}
    //         onCheckedChange={(value) => row.toggleSelected(!!value)}
    //         aria-label="Select row"
    //       />
    //     </div>
    //   ),
    // },
    {
      accessorKey: "date",
      enableResizing: true,
      // size: 200,
      header: ({ column }) => {
        return <SortButton column={column}>Date</SortButton>;
      },
      cell: ({ row, column, table }) => {
        const date = new Date(row.getValue("date"));
        const formattedDate = new Intl.DateTimeFormat("en-GB").format(date);
        const { updateData } = table.options.meta;

        const updateDate = (date: Date | undefined) => {
          if (!date) return;
          updateData(row.index, column.id, "date", date.toISOString());
        };

        return (
          <>
            {row.index === editingRow ? (
              <DatePickerDemo date={date} setDate={updateDate} />
            ) : (
              <TextCell>{formattedDate}</TextCell>
            )}
          </>
        );
      },
    },

    {
      accessorKey: "payee",
      enableResizing: true,
      // size: 300,
      header: ({ column }) => {
        return <SortButton column={column}>Payee</SortButton>;
      },
      cell: ({ row }) => {
        return <TextCell>{row.getValue("payee")}</TextCell>;
      },
    },
    {
      accessorKey: "category",
      // size: 200,
      header: ({ column }) => {
        return <SortButton column={column}>Category</SortButton>;
      },
      cell: ({ row }) => {
        const category = row.getValue("category")?.name || (
          <span className="bg-yellow-400/80 px-2 py-1 rounded-lg">
            Unassigned
          </span>
        );

        return <TextCell>{category}</TextCell>;
      },
    },
    {
      accessorKey: "memo",
      enableResizing: true,
      // size: 300,
      header: ({ column }) => {
        return <SortButton column={column}>Memo</SortButton>;
      },
      cell: ({ row, column, table }) => {
        const value = String(row.getValue("memo") ?? "");
        const [test, setTest] = useState(value);

        const { updateData } = table.options.meta;

        return (
          <>
            {row.index === editingRow ? (
              <Input
                className="focus:ring-0 focus-visible:ring-0 bg-white shadow-none text-md"
                value={test}
                onChange={(e) => {
                  setTest(e.target.value);
                }}
                onBlur={() => updateData(row.index, column.id, "memo", test)}
              />
            ) : (
              <TextCell>{value}</TextCell>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "outflow",
      enableResizing: true,
      // size: 200,
      header: ({ column }) => {
        return <SortButton column={column}>Outflow</SortButton>;
      },
      cell: ({ row, column, table }) => {
        const amount = parseFloat(row.getValue("outflow"));
        if (amount === 0) return null; // Or return "" for an empty string
        const formatted = new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: "GBP",
        }).format(amount);

        const { updateData } = table.options.meta;

        return <TextCell>{formatted}</TextCell>;
      },
    },
    {
      accessorKey: "inflow",
      enableResizing: false,
      // size: 200,
      header: ({ column }) => {
        return <SortButton column={column}>Inflow</SortButton>;
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("inflow"));
        if (amount === 0) return null;
        const formatted = new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: "GBP",
        }).format(amount);

        return <TextCell>{formatted}</TextCell>;
      },
    },
  ];
};

function TextCell({ children }: { children: ReactNode }) {
  return (
    <div className="text-nowrap overflow-hidden text-ellipsis">{children}</div>
  );
}

function SortButton({
  column,
  children,
}: {
  column: Column<Transaction, unknown>;
  children: React.ReactNode;
}) {
  const isSorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="w-full flex items-center justify-between hover:bg-transparent"
    >
      <span>{children}</span>
      {isSorted == "asc" ? (
        <ArrowUp />
      ) : isSorted == "desc" ? (
        <ArrowDown />
      ) : (
        ""
      )}
    </Button>
  );
}

const useTransactionManager = () => {
  const [deleteTransaction, { isSuccess }] = useDeleteTransactionMutation();

  const handleDeleteTranscation = (id: string) => {
    deleteTransaction({ transactionIds: [id] });
  };

  const handleDuplicateTransaction = (id: string) => {
    console.log("dup");
  };

  // TODO: need to move to somewhere
  const handleMoveTransaction = (id: string) => {
    console.log("move");
  };

  // useEffect(() => {
  //   if (isSuccess) {
  //     toast.success("Successfully deleted!");
  //   }
  // }, [isSuccess]);

  return {
    handleDeleteTranscation,
    handleDuplicateTransaction,
    handleMoveTransaction,
  };
};

export function MyTable({ transactions, addingTransaction }: TableProps) {
  const testRef = useRef<Transaction>(null);

  const [editTransaction] = useEditTransactionMutation();

  // Tanstack table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // Tracks the open/editing row
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [disableContextMenu, setDisableContextMenu] = useState<boolean>(false);
  const [sortingEnabled, setSortingEnabled] = useState(false);

  // Visual display when user has edited and interacting with another row
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Contains the edited row
  const [editedRow, setEditedRow] = useState<Transaction | null>(null);

  const {
    handleDeleteTranscation,
    handleDuplicateTransaction,
    handleMoveTransaction,
  } = useTransactionManager();

  const columns = generateColumns(editingRow);

  const derivedTransactions = useMemo(() => {
    return editedRow != null
      ? [editedRow, ...transactions.slice(editingRow!)]
      : transactions;
  }, [editedRow, transactions]);

  const table = useReactTable({
    data: derivedTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    // columnResizeMode: "onChange",
    // columnResizeDirection: "ltr",
    // enableColumnResizing: true,
    enableSorting: false,
    enableRowSelection: true,
    state: {
      sorting,
      rowSelection: rowSelection,
    },
    meta: {
      updateData: (
        rowIndex: number,
        columnId: string,
        field: string,
        value: Date,
      ) => {
        const updatedTransaction = {
          ...transactions[rowIndex],
          [field]: value,
        };
        setEditedRow(updatedTransaction);
      },
    },
  });

  const clearEditingRow = () => {
    setEditedRow(null);
    setEditingRow(null);
    setDisableContextMenu(false);
  };

  const handleRowClick = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    rowIndex: number,
  ) => {
    // TODO: handle shift select
    console.log(e.shiftKey);
    if (highlightedRow === rowIndex) {
      setDisableContextMenu(true);
      setEditingRow(rowIndex);
    } else if (editedRow != null) {
      editFlash();
    } else {
      setDisableContextMenu(false);
      setHighlightedRow(rowIndex);
      setEditingRow(null);
    }
  };

  const editFlash = () => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, 300);

    setTimeout(() => {
      setIsFlashing(true);
    }, 600);

    setTimeout(() => {
      setIsFlashing(false);
    }, 900);
  };

  // const confirmEdit = () => {
  //   console.log(editedRow);
  //   if (editedRow != null) {
  //     editTransaction([editedRow]);
  //   }
  //   clearEditingRow();
  // };

  return (
    <Table
      className="table-fixed select-none"
      style={{ width: `100%` }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (editedRow) {
          editFlash();
        } else {
          setEditingRow(null);
        }
      }}
    >
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
      <TableBody className="border border-r-neutral-300">
        {addingTransaction && <AddTransactionRow />}
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <>
              <ContextMenu>
                <ContextMenuTrigger asChild disabled={disableContextMenu}>
                  <TableRow
                    key={row.id}
                    data-state={highlightedRow === row.index && "selected"}
                    className={clsx(
                      editingRow === row.index && "border-b-0",
                      "data-[state=selected]:bg-sky-950/20 cursor-pointer",
                    )}
                    onClick={(e) => {
                      handleRowClick(e, row.index);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: `${cell.column.getSize()}px` }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40">
                  <ContextMenuItem
                    onClick={() => handleDeleteTranscation(row.original.id)}
                  >
                    Delete
                    <div>
                      <Trash2 size={15} />
                    </div>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleDuplicateTransaction(row.original.id)}
                  >
                    Duplicate
                    <div>
                      <Copy size={15} />
                    </div>
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled
                    onClick={() => handleMoveTransaction(row.original.id)}
                  >
                    Move to account
                    <div>
                      <MoveRight size={15} />
                    </div>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              {highlightedRow === row.index && editingRow === row.index && (
                <TableCell colSpan={7} className={clsx("bg-sky-950/20")}>
                  <div className="flex justify-end">
                    <div className="space-x-2">
                      <Button
                        variant={"outline"}
                        className={clsx(
                          "bg-transparent text-sky-950/80 border-blue-950/80 hover:bg-sky-950/30",
                        )}
                        onClick={clearEditingRow}
                      >
                        Cancel
                      </Button>
                      <Button
                        className={clsx(
                          isFlashing ? "bg-sky-950/10" : "bg-sky-950/80",
                          "text-white hover:bg-sky-950/30",
                        )}
                        onClick={confirmEdit}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </TableCell>
              )}
            </>
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
  );
}

/// TABLE COMPONENTS

function AddTransactionRow() {
  return (
    <>
      <TableRow className="bg-blue-700/20 hover:bg-blue-700/20 border-none">
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
          <InputOutline placeholder={"Memo"} />
        </TableCell>
        <TableCell>
          <InputOutline placeholder={"Outflow"} />
        </TableCell>
        <TableCell>
          <InputOutline placeholder={"Inflow"} />
        </TableCell>
      </TableRow>
      <TableRow className="bg-blue-700/20 hover:bg-blue-700/20">
        <TableCell colSpan={6}>
          <div className="flex justify-end space-x-2">
            <Button
              variant={"outline"}
              className={clsx(
                "bg-transparent text-sky-950/80 border-blue-950/80 hover:bg-sky-950/30",
              )}
              onClick={() => { }}
            >
              Cancel
            </Button>
            <Button
              className={clsx(
                // isFlashing ? "bg-sky-950/10" : "bg-sky-950/80",
                "text-white hover:bg-sky-950/30",
              )}
              onClick={() => { }}
            >
              Save
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

interface InputOutlineProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

function InputOutline({ className, ...props }: InputOutlineProps) {
  return (
    <Input
      className={cn(
        "bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 overflow-ellipsis",
        className,
      )}
      {...props}
    />
  );
}

type SelectCategoryForm = {
  showAddCategoryForm: boolean;
  name: string;
  categoryGroup: string;
};

//TODO: THIS NEEDS TO MATCH THE BACKEND / DATA ON FE
const AddCategorySchema = z.object({
  name: z.string(),
  //TODO: z.string().uuid()
  categoryGroup: z.string(),
  // categoryGroups: z.string().uuid(),
});

// SELECT CATEGORY COMPONENTS

function SelectCategory() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [createNewCategory, setCreateNewCategory] = useState(true);
  const { data } = useGetCategoriesQuery();

  const categories = data?.categories || {};
  const categoryGroupsOb = data?.categoryGroups || {};
  const categoryGroups = Object.values(categoryGroupsOb);

  const form = useForm<SelectCategoryForm>({
    defaultValues: {
      showAddCategoryForm: false,
      name: "",
      categoryGroup: "",
    },
    resolver: zodResolver(AddCategorySchema),
  });

  const { control, register, handleSubmit, watch, formState, setValue } = form;

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const showAddCategoryForm = watch("showAddCategoryForm");

  const toggleShowAddCategoryForm = () => {
    setValue("showAddCategoryForm", !showAddCategoryForm);
  };

  const onSubmit = (value: z.infer<typeof AddCategorySchema>) => {
    console.log("SelectCategory", value);
  };

  return (
    <Popover modal={true}>
      <PopoverTrigger className="w-full">
        {/* <InputOutline className="bg-white caret-transparent" /> */}
        <InputOutline
          className="caret-transparent"
          placeholder="Category"
          value={selectedCategory}
        />
      </PopoverTrigger>
      <PopoverPortal>
        {showAddCategoryForm ? (
          <PopoverContent className="w-[400px] overflow-scroll">
            <PopoverArrow className="w-8 h-2 fill-white" />
            <div className="px-4 py-3">
              {/*// TODO: ADD BACK BUTTON HERE */}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="categoryGroup"
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
            onPointerDownOutside={close}
            avoidCollisions={false}
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
                      const { id, name } = categories[categoryId];

                      return (
                        <CategoryContainer
                          onClick={() => handleSelectCategory(name)}
                        >
                          <Category>{name}</Category>
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

function Separator() {
  return <div className="h-[1px] bg-gray-400/50"></div>;
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
  return <p className={`${textColor}`}>£{value.toFixed(2)}</p>;
}

/// SELECT PAYEE COMPONENTS

function SelectPayee() {
  return (
    <Popover>
      <PopoverTrigger>
        <InputOutline placeholder="Payee" />
      </PopoverTrigger>
      <PopoverContent>Place content for the popover here.</PopoverContent>
    </Popover>
  );
}
