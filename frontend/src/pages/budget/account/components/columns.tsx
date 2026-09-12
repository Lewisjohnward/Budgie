import { ChevronDown, ChevronUp } from "lucide-react";
import { Column, createColumnHelper } from "@tanstack/react-table";
import { DetailedTransaction } from "../hooks/useAccountData";

const createSortableHeader =
  (label: string) =>
  ({ column }: { column: Column<any> }) => {
    const isSorted = column.getIsSorted();
    return (
      <button
        onClick={(e) => {
          column.toggleSorting(isSorted === "asc");
          e.stopPropagation();
        }}
        className="flex justify-between border border-neutral-300 items-center w-full h-full px-2 hover:text-blue-600"
      >
        {label}
        {isSorted === "asc" && <ChevronUp size={16} />}
        {isSorted === "desc" && <ChevronDown size={16} />}
      </button>
    );
  };

const columnHelper = createColumnHelper<DetailedTransaction>();

export const columns = [
  columnHelper.accessor("accountName", {
    id: "account",
    header: createSortableHeader("Account"),
    cell: (info) => {
      const value = info.getValue();

      return (
        <div className="truncate" title={value}>
          {value}
        </div>
      );
    },
  }),

  columnHelper.accessor((row) => new Date(row.date), {
    id: "date",
    header: createSortableHeader("Date"),
    cell: (info) => info.getValue().toLocaleDateString("en-GB"),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || !filterValue.start || !filterValue.end) {
        return true;
      }

      const rowDate = row.getValue<Date>(columnId);

      return rowDate >= filterValue.start && rowDate <= filterValue.end;
    },
  }),

  columnHelper.accessor("payee", {
    header: createSortableHeader("Payee"),
    cell: (info) => info.getValue() ?? "",
  }),

  columnHelper.accessor(
    (row) => {
      if (row.unassigned) return "This needs a category";

      return `${row.categoryGroup.name} : ${row.category.name}`;
    },
    {
      id: "category",
      header: createSortableHeader("Category"),
      cell: (info) => {
        const value = info.getValue();
        const unassigned = info.row.original.unassigned;

        return (
          <div title={value} className="truncate">
            <span
              className={
                unassigned ? "bg-yellow-300/70 px-2 py-[2px] rounded-lg" : ""
              }
            >
              {value}
            </span>
          </div>
        );
      },
    }
  ),

  columnHelper.accessor("memo", {
    header: createSortableHeader("Memo"),
    cell: (info) => {
      const value = info.getValue();

      return (
        <div className="truncate" title={value ?? ""}>
          {value}
        </div>
      );
    },
  }),

  columnHelper.accessor("outflow", {
    id: "outflow",
    header: createSortableHeader("Outflow"),
    cell: (info) => {
      const value = info.getValue();

      return value === 0 ? "" : `£${value.toFixed(2)}`;
    },
  }),

  columnHelper.accessor("inflow", {
    id: "inflow",
    header: createSortableHeader("Inflow"),
    cell: (info) => {
      const value = info.getValue();

      return value === 0 ? "" : `£${value.toFixed(2)}`;
    },
  }),
];
