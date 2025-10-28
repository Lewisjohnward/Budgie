import { useCallback, useMemo, useState } from "react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "../components/columns";

type Transaction = {
  id: string;
  accountId: string;
  categoryId: string | null;
  date: Date;
  inflow: number | null;
  outflow: number | null;
  payee: string | null;
  memo: string | null;
  cleared: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: any;
  categoryGroup: any;
};

export const useTransactionTable = (
  transactions: Transaction[],
  accountId: string
) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [lastRowSelection, setLastRowSelection] = useState<RowSelectionState>(
    {}
  );
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: "date" },
  ]);

  const columnVisibility = useMemo(
    () => ({
      account: accountId === "all",
    }),
    [accountId]
  );

  // const tableSorting = useMemo(
  //   () => [
  //     {
  //       id: "date",
  //       desc: true,
  //     },
  //   ],
  //   []
  // );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
  //   { id: "category", value: "stuff" },
  // ]);

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,
    enableSorting: true,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row.id,
    state: {
      rowSelection,
      columnVisibility,
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
  });
  // visual row order !== data array index order
  // row.id represents the original data index array, not the visual position
  const [lastRowSelectionIndex, setLastRowSelectionIndex] = useState<
    number | null
  >(null);

  const handleSetColumnFilters = (filters: ColumnFiltersState) => {
    if (filters[0].id === "") {
      setGlobalFilter(filters[0].value);
    } else {
      const newFilters = filters.flatMap((f) => {
        if (f.id === "") {
          // apply this filter to all columns
          const test = columns
            .filter((col) => col.accessorKey) // only real data columns
            .filter((col) => col.accessorKey != "accountName") // only real data columns
            .map((col) => ({
              id: col.accessorKey!, // force unwrap since accessorKey exists
              value: f.value,
            }));
          return test;
        } else {
          return f; // normal filter
        }
      });
      setColumnFilters(newFilters);
    }
  };

  const onRowSelection = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, row: any) => {
      const currentSelection = { ...rowSelection };

      if (e.shiftKey) {
        const startIndex = lastRowSelectionIndex ?? row.index;
        const endIndex = row.index;
        const [min, max] =
          startIndex < endIndex
            ? [startIndex, endIndex]
            : [endIndex, startIndex];

        const selectedRows = Object.fromEntries(
          table
            .getRowModel()
            .rows.slice(min, max + 1)
            .map((r) => [r.id, true])
        );

        table.setRowSelection({ ...currentSelection, ...selectedRows });
      } else if (e.ctrlKey || e.metaKey) {
        table.setRowSelection((prev) => ({
          ...prev,
          [row.id]: !prev[row.id],
        }));
      } else {
        table.resetRowSelection();
        row.toggleSelected();
      }

      // Save visual index (row.index) for shift-selection
      setLastRowSelectionIndex(row.index);
    },
    [lastRowSelectionIndex, rowSelection, table]
  );

  const onRowSelectionContextMenu = useCallback(
    (row: any) => {
      if (!rowSelection[row.id]) {
        table.setRowSelection({ [row.id]: true });
        setLastRowSelection({ [row.id]: true });
      }
    },
    [rowSelection, table]
  );

  // const selectedRowIds = useMemo(
  //   () => Object.keys(rowSelection).map((key) => transactions[Number(key)].id),
  //   [rowSelection, transactions]
  // );
  const selectedRowIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map((id) => {
          const row = table.getRow(id);
          return row?.original.id; // safe, stable ID from original data
        })
        .filter(Boolean), // remove any undefined
    [rowSelection, table]
  );

  const numberOfRows = useMemo(
    () => Object.keys(rowSelection).length,
    [rowSelection]
  );

  const displaySelectionModal = numberOfRows > 0;

  const cancelSelection = () => setRowSelection({});

  /// filter
  const accountName = "test";
  const [queries, setQueries] = useState<{ id: string; value: string }[]>([]);
  const [query, setQuery] = useState("");
  const queryPresent = query.length > 0;
  const clearQueries = () => {
    setQuery("");
    setQueries([]);
    table.resetColumnFilters();
  };

  const addQuery = ({ id, value }: { id: string; value: string }) => {
    setQueries((prev) => [...prev, { id, value }]);
    setQuery("");
    handleSetColumnFilters([{ id, value }]);
  };

  const queriesString = queries.map(({ id, value }) => {
    if (!id) return value;
    return `${id.charAt(0).toUpperCase() + id.slice(1)}: ${value}`;
  });

  const updateQuery = (value: string) => {
    const result = value.slice(value.lastIndexOf(",") + 1);
    if (result === queriesString.join("")) return;

    setQuery(result);
  };

  const queryInputValue =
    queries.length > 0 ? queriesString.join(",") + "," + query : query;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setGlobalFilter(query);
      setQueries((prev) => [...prev, { id: "", value: query }]);
      setQuery("");
    }
  };

  const clearFilters = () => {
    setColumnFilters([]);
    setQueries([]);
    setGlobalFilter("");
    setQuery("");
  };

  const [focused, setFocused] = useState(false);

  const filters = queriesString;

  /// Date filter
  const [open, setOpen] = useState(false);
  const openPopover = () => setOpen(true);

  const [activeFilter, setActiveFilter] = useState("All Dates");

  const earliestTransactionDate = useMemo(() => {
    if (transactions.length === 0) return null;
    return transactions.reduce((earliest, transaction) => {
      const transactionDate = new Date(transaction.date);
      const earliestDate = new Date(earliest);
      return transactionDate < earliestDate ? transaction.date : earliest;
    }, transactions[0].date);
  }, [transactions]);

  const earliestYear = earliestTransactionDate
    ? new Date(earliestTransactionDate).getFullYear().toString()
    : new Date().getFullYear().toString();

  const earliestMonth = earliestTransactionDate
    ? new Date(earliestTransactionDate).toLocaleString("en-US", {
      month: "long",
    })
    : new Date().toLocaleString("en-US", { month: "long" });

  const futureYear = earliestYear
    ? (parseInt(earliestYear) + 10).toString()
    : new Date().getFullYear().toString();

  const months = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const minYear = Math.min(parseInt(earliestYear), currentYear - 5);
    const maxYear = parseInt(futureYear);
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  }, [earliestYear, futureYear]);

  const [dateRange, setDateRange] = useState({
    fromMonth: earliestMonth,
    fromYear: earliestYear,
    toMonth: earliestMonth,
    toYear: futureYear,
  });

  // Store the last applied filter to reset to when popover closes without applying
  const [appliedDateRange, setAppliedDateRange] = useState(dateRange);

  const closePopover = useCallback(() => {
    // Reset to last applied filter when closing without applying
    setDateRange(appliedDateRange);
    setOpen(false);
  }, [appliedDateRange]);

  const applyDateRangeFilter = useCallback(
    (range: typeof dateRange) => {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const fromMonthIndex = monthNames.indexOf(range.fromMonth);
      const toMonthIndex = monthNames.indexOf(range.toMonth);

      if (fromMonthIndex === -1 || toMonthIndex === -1) return;

      const startDate = new Date(parseInt(range.fromYear), fromMonthIndex, 1);
      const endDate = new Date(parseInt(range.toYear), toMonthIndex + 1, 0);

      table
        .getColumn("date")
        ?.setFilterValue({ start: startDate, end: endDate });
    },
    [table]
  );

  const handleFilterChange = useCallback(
    (filterLabel: string) => {
      setActiveFilter(filterLabel);

      const now = new Date();
      const currentMonth = now.toLocaleString("en-US", { month: "long" });
      const currentYear = now.getFullYear().toString();

      let newRange: typeof dateRange;

      switch (filterLabel) {
        case "This Month":
          newRange = {
            fromMonth: currentMonth,
            fromYear: currentYear,
            toMonth: currentMonth,
            toYear: currentYear,
          };
          break;

        case "Latest 3 Months":
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          newRange = {
            fromMonth: threeMonthsAgo.toLocaleString("en-US", {
              month: "long",
            }),
            fromYear: threeMonthsAgo.getFullYear().toString(),
            toMonth: currentMonth,
            toYear: currentYear,
          };
          break;

        case "This Year":
          newRange = {
            fromMonth: "January",
            fromYear: currentYear,
            toMonth: currentMonth,
            toYear: currentYear,
          };
          break;

        case "Last Year":
          const lastYear = (now.getFullYear() - 1).toString();
          newRange = {
            fromMonth: "January",
            fromYear: lastYear,
            toMonth: "December",
            toYear: lastYear,
          };
          break;

        case "All Dates":
        default:
          newRange = {
            fromMonth: earliestMonth,
            fromYear: earliestYear,
            toMonth: earliestMonth,
            toYear: futureYear,
          };
          break;
      }

      setDateRange(newRange);
      setAppliedDateRange(newRange);
      applyDateRangeFilter(newRange);
      setOpen(false);
    },
    [earliestMonth, earliestYear, applyDateRangeFilter]
  );

  const applyDateFilter = useCallback(() => {
    setAppliedDateRange(dateRange);
    applyDateRangeFilter(dateRange);
    setOpen(false);
  }, [dateRange, applyDateRangeFilter]);

  // Check if any filters are active and hiding rows
  const totalRows = table.getCoreRowModel().rows.length;
  const filteredRows = table.getFilteredRowModel().rows.length;
  const isFiltered = totalRows > filteredRows;

  const clearAllFilters = useCallback(() => {
    // Clear search filters
    clearFilters();
    // Reset date filter to "All Dates"
    handleFilterChange("All Dates");
  }, [handleFilterChange]);

  return {
    table,
    onRowSelection,
    onRowSelectionContextMenu,
    selectedRowIds,
    numberOfRows,
    displaySelectionModal,
    cancelSelection,
    handleSetColumnFilters,
    isFiltered,
    clearAllFilters,
    filterState: {
      dateFilter: {
        activeFilter,
        setActiveFilter,
        handleFilterChange,
        openPopover,
        closePopover,
        // TODO(lewis 2025-11-23 18:36): rename to isPopoverOpen
        open: open,
        applyDateFilter,
        dateRange,
        setDateRange,
        months,
        years,
      },
      searchFilter: {
        accountName,
        queries,
        query,
        queryPresent,
        clearQueries,
        addQuery,
        queriesString,
        updateQuery,
        inputValue: queryInputValue,
        clearFilters,
        handleKeyPress,
        filters,
        focused,
        setFocused,
      },
    },
  };
};

export type TransactionTableState = ReturnType<typeof useTransactionTable>;
export type FilterState = TransactionTableState["filterState"];
export type DateFilterState = FilterState["dateFilter"];
export type SearchFilterState = FilterState["searchFilter"];
