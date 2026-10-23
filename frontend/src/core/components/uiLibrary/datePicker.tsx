import { Calendar } from "@/core/components/uiLibrary/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { usePopover } from "@/pages/budget/account/components/transactionEditorRow/selectCategory";
import { ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function DatePickerDemo() {
  const { setValue, watch } = useFormContext();

  const date = watch("date");
  const setDate = (date: Date | undefined) => {
    if (!date) {
      setValue("date", date, { shouldDirty: true });
      return;
    }
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    setValue("date", utcDate, { shouldDirty: true });
  };

  const popover = usePopover();
  const input = "12/12/25";
  const handleInputChange = () => { };

  return (
    <Popover open={popover.isOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden">
          <input
            className="px-2 w-full rounded-sm text-ellipsis focus:outline-none focus:ring-0"
            placeholder="Payee"
            onFocus={popover.handleOpen}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                popover.handleClose();
              }
            }}
          />
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={popover.handleClose}
        className="w-auto p-0 border border-white"
      >
        <Calendar
          mode="single"
          className="border-sky-950"
          selected={date}
          onSelect={setDate}
        />
      </PopoverContent>
    </Popover>
  );
}
