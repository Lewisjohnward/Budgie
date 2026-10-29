import { ChevronDown, ChevronUp } from "lucide-react";
import { Column, createColumnHelper } from "@tanstack/react-table";
import { DetailedTransaction } from "../hooks/useAccountData/types";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";

// date column sizing
// laptop
// account - 50 is perfect
// all accounts - 60 is perfect

//desktop
// account -
// all accounts - 30 is perfect

const checkboxColumnSizing = {
  size: 10,
  minSize: 10,
  maxSize: 10,
};

const accountColumnSizing = {
  size: 50,
  minSize: 50,
  maxSize: 50,
};

const dateColumnSizing = {
  size: 60,
  minSize: 60,
  maxSize: 60,
};

const payeeColumnSizing = {
  size: 100,
  minSize: 50,
  maxSize: 240,
};

const textColumnSizing = {
  size: 240,
  minSize: 50,
  maxSize: 500,
};

const financeColumnSizing = {
  size: 50,
  minSize: 50,
  maxSize: 50,
};

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

const createHeader = (label: string) => (thing: { thing: any }) => {
  const table = thing.table;

  const isAllSelected = table.getIsAllRowsSelected();
  const isIndeterminate = !isAllSelected && table.getIsSomeRowsSelected();

  return (
    <div className="flex justify-between border border-neutral-300 items-center w-full h-full px-2 hover:text-blue-600">
      <Checkbox
        aria-label="Toggle select all transactions"
        className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none"
        checked={isIndeterminate ? "indeterminate" : isAllSelected}
        onCheckedChange={() => {
          table.toggleAllRowsSelected(
            isIndeterminate || isAllSelected ? false : true
          );
        }}
      />
    </div>
  );
};

const columnHelper = createColumnHelper<DetailedTransaction>();

export const columns = [
  columnHelper.display({
    id: "checkbox",
    ...checkboxColumnSizing,
    header: createHeader("Checkbox"),
    cell: (info) => {
      const isSelected = info.row.getIsSelected();
      return (
        <div>
          <Checkbox
            className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none"
            checked={isSelected}
            onClick={(e) => {
              e.stopPropagation();

              info.row.toggleSelected();
            }}
          />
        </div>
      );
    },
  }),

  columnHelper.accessor("accountName", {
    id: "account",
    ...accountColumnSizing,
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
    ...dateColumnSizing,
    header: createSortableHeader("Date"),
    cell: (info) => {
      const value = info.getValue().toLocaleDateString("en-GB");

      return (
        <div className="truncate" title={value}>
          {value}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || !filterValue.start || !filterValue.end) {
        return true;
      }

      const rowDate = row.getValue<Date>(columnId);

      return rowDate >= filterValue.start && rowDate <= filterValue.end;
    },
  }),

  columnHelper.accessor("payee", {
    ...payeeColumnSizing,
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
      ...textColumnSizing,
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
    ...textColumnSizing,
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
    ...financeColumnSizing,
    header: createSortableHeader("Outflow"),
    cell: (info) => {
      const value = info.getValue();

      return value === 0 ? (
        ""
      ) : (
        <div className="text-right">{`£${value.toFixed(2)}`}</div>
      );
    },
  }),

  columnHelper.accessor("inflow", {
    id: "inflow",
    ...financeColumnSizing,
    header: createSortableHeader("Inflow"),
    cell: (info) => {
      const value = info.getValue();

      return value === 0 ? (
        ""
      ) : (
        <div className="text-right">{`£${value.toFixed(2)}`}</div>
      );
    },
  }),
];
