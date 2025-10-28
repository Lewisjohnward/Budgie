import clsx from "clsx";
import { SearchIcon } from "lucide-react";
import { MdCancel } from "react-icons/md";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";

// TODO:(lewis 2025-12-04 20:35) these props can come from hook
type TransactionSearchFilterProps = {
  accountName: string;
  queries: { id: string; value: string }[];
  query: string;
  queryPresent: boolean;
  clearQueries: () => void;
  addQuery: (query: { id: string; value: string }) => void;
  queriesString: string[];
  updateQuery: (value: string) => void;
  inputValue: string;
  clearFilters: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  filters: string[];
  focused: boolean;
  setFocused: (focused: boolean) => void;
};

const filterOptions = [
  { id: "any", field: "", text: "in any" },
  { id: "payee", field: "payee", text: "in payee" },
  { id: "category", field: "category", text: "in category" },
  { id: "memo", field: "memo", text: "in memo" },
];

export function TransactionSearchFilter({
  accountName,
  queries,
  query,
  queryPresent,
  clearQueries,
  addQuery,
  queriesString,
  updateQuery,
  inputValue,
  clearFilters,
  handleKeyPress,
  filters,
  focused,
  setFocused,
}: TransactionSearchFilterProps) {
  return (
    <Popover open={queryPresent}>
      <PopoverTrigger asChild>
        <div
          className={clsx(
            queries.length > 0 ? "w-[300px] border-blue-800" : "w-48",
            "flex justify-between px-2 py-1 bg-white border border-gray-400/50 rounded overflow-hidden focus-within:w-[300px] focus-within:border-blue-800 transition-all duration-300"
          )}
        >
          <div className="flex-1 flex items-center gap-2">
            <SearchIcon size={15} className="text-gray-500" />
            <input
              className="w-full text-sm font-[500] text-gray-700 placeholder:text-gray-500 focus:outline-none"
              placeholder={`Search ${accountName}`}
              onChange={(e) => {
                updateQuery(e.target.value);
              }}
              value={inputValue}
              onKeyDown={handleKeyPress}
            />
          </div>
          {(queryPresent || queries.length > 0) && (
            <button type="button" onClick={clearFilters}>
              <MdCancel size={15} className="text-gray-500" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-96 py-4 shadow-xl border border-gray-400/20 text-nowrap overflow-scroll"
        align={"end"}
        alignOffset={5}
      >
        {filterOptions.map(({ id, field, text }) => (
          <button
            key={id}
            type="button"
            className="w-full flex gap-4 px-4 py-1 
            hover:bg-gray-100"
            onClick={() => {
              addQuery({ id: field, value: query });
            }}
          >
            <span className="flex-shrink-0 w-16 text-right">
              {field && `${field}:`}
            </span>
            <span>
              find <span className="font-[500]">"{query}"</span> {text}
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
