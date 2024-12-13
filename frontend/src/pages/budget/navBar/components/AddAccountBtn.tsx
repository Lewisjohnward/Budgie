import clsx from "clsx";
import { AddIcon } from "@/core/icons/icons";
import { darkBlueText } from "@/core/theme/colors";
import useMouseOver from "@/core/hooks/useMouseOver";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/uiLibrary/dialog";
import { AddAccount } from "@/core/components/AddAccountForm";

export function AddAccountBtn() {
  const { mouseOver, handleMouseOver } = useMouseOver();
  return (
    <Dialog>
      <DialogTrigger
        onMouseEnter={handleMouseOver}
        className="flex items-center gap-1 py-1 pl-1 pr-3 ml-2 rounded bg-white/10 hover:bg-white/20"
      >
        <AddIcon
          className={clsx(mouseOver && "animate-shake", "h-6 w-6")}
          data-testid="icon"
        />
        <p className="text-sm">Add Account</p>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        className="w-80"
        data-testid="add-account-dialog"
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className={`text-center ${darkBlueText}`}>
            Add Account
          </DialogTitle>
          <DialogDescription>
            Let's get started! No need to worry—if you change your mind, you can
            always alter the information later.
          </DialogDescription>
        </DialogHeader>
        <AddAccount />
      </DialogContent>
    </Dialog>
  );
}
