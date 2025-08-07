import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/core/components/uiLibrary/tooltip";
import { formatCurrency } from "../../../../../../../utils/formatCurrency";

interface BalanceRowProps {
  label: string;
  value: number;
  tooltipText?: string;
}

export function BalanceRow({ label, value, tooltipText }: BalanceRowProps) {
  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={500}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between text-sm font-[500] cursor-auto">
            <p>{label}</p>
            <p>{formatCurrency(value)}</p>
          </div>
        </TooltipTrigger>
        {tooltipText && (
          <TooltipContent
            side="bottom"
            sideOffset={5}
            align="start"
            className="bg-gray-700 !transition-none !animate-none !duration-0"
          >
            <p className="max-w-[300px]">{tooltipText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
