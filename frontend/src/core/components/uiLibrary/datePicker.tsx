import { format } from "date-fns";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/components/uiLibrary/button";
import { Calendar } from "@/core/components/uiLibrary/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="h-5 flex items-center pr-2 bg-white ring-[1px] ring-sky-700 rounded overflow-hidden">
          <Button
            variant={"outline"}
            className={cn(
              "h-auto py-0 px-2 shadow-none w-full justify-between font-normal overflow-hidden border-0 hover:bg-white",
              !date && "text-muted-foreground",
            )}
          >
            {date ? (
              <span className="truncate">{format(date, "MM/dd/yy")}</span>
            ) : (
              <span className="text-gray-400 truncate">Pick a date</span>
            )}
          </Button>
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 caret-transparent">
        <Calendar
          mode="single"
          className="border-sky-950"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
