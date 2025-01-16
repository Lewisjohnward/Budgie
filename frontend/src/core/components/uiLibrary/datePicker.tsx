import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/core/lib/utils";
import { Button } from "@/core/components/uiLibrary/button";
import { Calendar } from "@/core/components/uiLibrary/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { Dispatch, SetStateAction, useState } from "react";

export function DatePickerDemo({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal overflow-hidden",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-neutral-500" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 caret-transparent">
        <Calendar
          mode="single"
          className="border-sky-950"
          selected={date}
          onSelect={(e) => setDate(e)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
