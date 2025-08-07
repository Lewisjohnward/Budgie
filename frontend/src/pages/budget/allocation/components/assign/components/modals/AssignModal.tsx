import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/core/components/uiLibrary/dialog";

import { Button } from "@/core/components/uiLibrary/button";
import { cn } from "@/core/lib/utils";
import { getModalState } from "./assignModalStateMachine";
import { AutoAssignModalState } from "../../hooks/useAutoAssign";

export function AssignModal({ modalState }: { modalState: AutoAssignModalState }) {
  const { open, onConfirm, onClose, onNextMonth, fundingState } = modalState;
  if (!fundingState) {
    return null;
  }

  const currentState = getModalState(fundingState);

  if (!currentState) {
    return null;
  }

  const handleAction = (action: "close" | "assign" | "nextMonth") => {
    if (action === "close") {
      onClose();
    } else if (action === "assign") {
      onConfirm();
    } else if (action === "nextMonth") {
      onNextMonth();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-1 gap-0" aria-describedby={undefined}>
        <DialogTitle className="border-b p-5 text-stone-900">
          Auto-Assign Preview: {currentState.title}
        </DialogTitle>
        <div className="p-5 space-y-2 font-medium max-h-[calc(100vh-150px)] overflow-y-scroll">
          {currentState.content(fundingState)}
        </div>
        <DialogFooter className="flex justify-end items-end gap-2 px-5 py-2 border-t">
          {currentState.buttons.map((button, index) => (
            <Button
              key={index}
              className={cn("min-w-[60px]", {
                "bg-sky-950 hover:bg-sky-950/80":
                  button.variant !== "secondary",
                "bg-gray-400/40 hover:bg-gray-400/60 text-sky-950":
                  button.variant === "secondary",
              })}
              onClick={() => handleAction(button.action)}
            >
              {button.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
