import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { Button } from "@/core/components/uiLibrary/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/uiLibrary/select";
import { DateFilterState } from "../hooks/useTransactionTable";

type TransactionDateFilterProps = {
  dateFilter: DateFilterState;
};

// default is display all months - from is the date of the first transaction, to is to current month

export function TransactionDateFilter({
  dateFilter,
}: TransactionDateFilterProps) {
  const { months, years } = dateFilter;

  // TODO:(lewis 2025-12-04 20:40) should this be here?
  const filterOptions = [
    {
      label: "This Month",
    },
    {
      label: "Latest 3 Months",
    },
    {
      label: "This Year",
    },
    {
      label: "Last Year",
    },
    {
      label: "All Dates",
    },
  ];

  return (
    <Popover open={dateFilter.open} modal={true}>
      <PopoverTrigger asChild>
        <button
          onClick={dateFilter.openPopover}
          className={clsx(
            "flex items-center justify-center gap-2 h-7 px-2 text-sky-700 rounded text-sm hover:bg-blue-700/10"
          )}
        >
          view
          <ChevronDown size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        onEscapeKeyDown={dateFilter.closePopover}
        onPointerDownOutside={dateFilter.closePopover}
        onFocusOutside={(e) => e.preventDefault()}
        className="w-[600px] p-4 space-y-2 shadow-xl border border-gray-400/20 text-nowrap"
        align={"end"}
        alignOffset={0}
      >
        <h1 className="font-[500] text-lg">View Options</h1>
        <div className="h-[1px] border-t border-gray-400/40" />
        <div className="flex justify-around items-center gap-2">
          {filterOptions.map((option) => (
            <FilterButton
              key={option.label}
              active={dateFilter.activeFilter === option.label}
              onClick={() => dateFilter.handleFilterChange(option.label)}
            >
              {option.label}
            </FilterButton>
          ))}
        </div>
        <div className="h-[1px] border-t border-gray-400/40" />
        <div className="flex justify-between gap-4">
          <div className="flex-1 flex items-center gap-2">
            <p className="text-md font-[500]">From:</p>
            <Select
              value={dateFilter.dateRange.fromMonth}
              onValueChange={(value) =>
                dateFilter.setDateRange((prev) => ({
                  ...prev,
                  fromMonth: value,
                }))
              }
            >
              <SelectTrigger className="flex-1 shadow-none text-black data-[placeholder]:text-black border focus:ring-blue-800">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={dateFilter.dateRange.fromYear}
              onValueChange={(value) =>
                dateFilter.setDateRange((prev) => ({
                  ...prev,
                  fromYear: value,
                }))
              }
            >
              <SelectTrigger className="flex-1 shadow-none text-black data-[placeholder]:text-black border focus:ring-blue-800">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <p className="text-md font-[500]">To:</p>
            <Select
              value={dateFilter.dateRange.toMonth}
              onValueChange={(value) =>
                dateFilter.setDateRange((prev) => ({ ...prev, toMonth: value }))
              }
            >
              <SelectTrigger className="flex-1 shadow-none text-black data-[placeholder]:text-black border focus:ring-blue-800">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={dateFilter.dateRange.toYear}
              onValueChange={(value) =>
                dateFilter.setDateRange((prev) => ({ ...prev, toYear: value }))
              }
            >
              <SelectTrigger className="flex-1 shadow-none text-black data-[placeholder]:text-black border focus:ring-blue-800">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-[1px] border-t border-gray-400/40" />
        <div className="flex justify-end items-center gap-4">
          <Button
            className="bg-gray-200/60 text-sky-700 hover:bg-gray-200/80 shadow-none transiton-none"
            onClick={dateFilter.closePopover}
          >
            Cancel
          </Button>
          <Button
            className="bg-sky-700 hover:bg-sky-800 shadow-none transiton-none"
            onClick={dateFilter.applyDateFilter}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type FilterButtonProps = {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
};

function FilterButton({ children, active, onClick }: FilterButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={clsx(
        "h-7 px-4 rounded-3xl shadow-none text-sm font-[500] transition-none",
        active
          ? "bg-sky-700 text-white hover:bg-sky-800"
          : "bg-transparent text-sky-700 hover:text-white hover:bg-sky-700"
      )}
    >
      {children}
    </Button>
  );
}
