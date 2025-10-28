import { Calendar } from "@/core/components/uiLibrary/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { PopoverArrow } from "@radix-ui/react-popover";
import { SelectDateModel } from "../../../hooks/useTransactionFormRow";

type SelectDateProps = {
  selectDate: SelectDateModel;
};

export function SelectDate({ selectDate }: SelectDateProps) {
  const { setValue, watch } = useFormContext();

  const date = watch("date");

  const handlePointerDownOutside = (e: Event) => {
    // Don't close if clicking the input
    if (selectDate.ref.current?.contains(e.target as Node)) {
      e.preventDefault();
      return;
    }
    selectDate.popover.close();
  };

  return (
    <Popover open={selectDate.popover.isOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden">
          <input
            className="px-2 w-full rounded-sm text-ellipsis focus:outline-none focus:ring-0"
            placeholder="Payee"
            ref={selectDate.ref}
            onFocus={selectDate.popover.open}
            value={selectDate.input}
            // onBlur={selectDate.onBlur}
            onChange={selectDate.onChange}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                selectDate.popover.close();
              }
            }}
          />
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={handlePointerDownOutside}
        className="w-auto p-0 border border-white"
      >
        <PopoverArrow className="w-8 h-2 fill-white" />
        <Calendar
          mode="single"
          className="border-sky-950"
          month={date}
          selected={date}
          onSelect={selectDate.select}
        />
      </PopoverContent>
    </Popover>
  );
}
