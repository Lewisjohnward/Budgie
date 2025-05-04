export const columns = [
  {
    accessorKey: "accountName",
    id: "account",
    header: "Account",
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
      if (row.unassigned) return "This needs a category";
      return `${row.categoryGroup.name} : ${row.category.name}`;
    },
    id: "category",
    header: "Category",
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
