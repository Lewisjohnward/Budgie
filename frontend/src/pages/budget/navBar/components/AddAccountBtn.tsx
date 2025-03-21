import clsx from "clsx";
import { AddIcon } from "@/core/icons/icons";
import useMouseOverTimeout from "@/core/hooks/useMouseOverTimeout";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/core/components/uiLibrary/dialog";
import { AddAccountForm } from "@/pages/budget/navBar/components/AddAccountForm";
import { useState } from "react";

export function AddAccountBtn() {
  const { mouseOver, handleMouseOver } = useMouseOverTimeout();
  const [displayModal, setDisplayModal] = useState(false);

  const closeModal = () => setDisplayModal(false);
  const openModal = () => setDisplayModal(true);

  return (
    <Dialog open={displayModal} onOpenChange={setDisplayModal}>
      <DialogTrigger
        onClick={openModal}
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
        className="w-[360px] min-h-[600px] px-0 pb-0"
        data-testid="add-account-dialog"
      >
        <AddAccountForm close={closeModal} />
      </DialogContent>
    </Dialog>
  );
}
