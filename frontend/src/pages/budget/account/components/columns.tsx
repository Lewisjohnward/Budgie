import { ChevronDown, ChevronUp } from "lucide-react";
import { Column } from "@tanstack/react-table";

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

export const columns = [
  {
    accessorKey: "accountName",
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
  },
  {
    accessorFn: (row) => new Date(row.date),
    id: "date",
    header: createSortableHeader("Date"),
    cell: (info) => info.getValue<Date>().toLocaleDateString("en-GB"),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || !filterValue.start || !filterValue.end) return true;
      const rowDate = row.getValue<Date>(columnId);
      return rowDate >= filterValue.start && rowDate <= filterValue.end;
    },
  },
  {
    accessorKey: "payee",
    header: createSortableHeader("Payee"),
    cell: (info) => info.getValue() ?? "",
  },
  {
    accessorFn: (row) => {
      if (row.unassigned) return "This needs a category";
      return `${row.categoryGroup.name} : ${row.category.name}`;
    },
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
  },
  {
    accessorKey: "memo",
    header: createSortableHeader("Memo"),
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
    header: createSortableHeader("Outflow"),
    cell: (info) => {
      const value = info.getValue<number>();
      return value === 0 ? "" : `£${value.toFixed(2)}`;
    },
  },
  {
    accessorKey: "inflow",
    id: "inflow",
    header: createSortableHeader("Inflow"),
    cell: (info) => {
      const value = info.getValue<number>();
      return value === 0 ? "" : `£${value.toFixed(2)}`;
    },
  },
];
