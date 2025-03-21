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
  const [date, setDate] = useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "h-auto py-0 px-2 shadow-none w-full justify-between font-normal overflow-hidden ring-[1px] ring-sky-700 hover:bg-white",
            !date && "text-muted-foreground",
          )}
        >
          {date ? format(date, "MM/dd/yy") : <span>Pick a date</span>}
          <ChevronDown className="text-sky-950" />
        </Button>
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
