import { bgGray } from "@/core/theme/colors";
import { formatCurrency } from "@/utils/formatCurrency";
import { AutoAssignToggle } from "./AutoAssignToggle";
import { Button } from "@/core/components/uiLibrary/button";
import { AutoAssignState } from "../../hooks/useAutoAssign";
import { FundingOption } from "../../types/assignTypes";

const BUTTON_CONFIG = {
  [FundingOption.UNDERFUNDED]: { label: "Underfunded" },
  [FundingOption.ASSIGN_LAST_MONTH]: { label: "Assigned Last Month" },
  [FundingOption.SPENT_LAST_MONTH]: { label: "Spent Last Month" },
  [FundingOption.AVERAGE_ASSIGNED]: { label: "Average Assigned" },
  [FundingOption.AVERAGE_SPENT]: { label: "Average Spent" },
  [FundingOption.RESET_ASSIGNED]: { label: "Reset Assigned Amounts" },
  [FundingOption.RESET_AVAILABLE]: { label: "Reset Available Amounts" },
} as const;

const BUTTON_GROUPS = [
  { buttons: [FundingOption.UNDERFUNDED], conditional: true },
  {
    buttons: [
      FundingOption.ASSIGN_LAST_MONTH,
      FundingOption.SPENT_LAST_MONTH,
      FundingOption.AVERAGE_ASSIGNED,
      FundingOption.AVERAGE_SPENT,
    ],
  },
  { buttons: [FundingOption.RESET_ASSIGNED, FundingOption.RESET_AVAILABLE] },
];

const buttonStyles = `py-1 px-2 w-full flex justify-between text-black ${bgGray} rounded whitespace-nowrap hover:bg-gray-300/80 transition-colors`;

export function AutoAssign({ assign, ui }: AutoAssignState) {
  return (
    <div className="flex-grow bg-white rounded-lg">
      <AutoAssignToggle open={ui.open} toggleOpen={ui.toggleOpen} />
      {ui.open && (
        <div className="p-4 space-y-4">
          {BUTTON_GROUPS.map((group, index) => {
            const showGroup = group.conditional ? assign.display : true;
            if (!showGroup) return null;

            return (
              <div key={index} className="space-y-1">
                {group.buttons.map((action) => (
                  <Button
                    key={action}
                    onClick={() => assign.handler(action)}
                    className={buttonStyles}
                  >
                    <span>{BUTTON_CONFIG[action]?.label || ""}</span>
                    <span>{formatCurrency(assign.amount(action))}</span>
                  </Button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
