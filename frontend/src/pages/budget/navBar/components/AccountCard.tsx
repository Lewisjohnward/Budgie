// TODO: HANDLE THE ROUTING ON THE NAVBAR WHEN EACH PAAGE IS OPEN
// TODO: MAYBE SPLIT UP THE NAVBAR COMPONENTS
// TODO: FIX TYPING OF Account component

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/uiLibrary/dialog";
import { darkBlueText } from "@/core/theme/colors";
import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useIsRoute } from "../hooks/useIsRoute";

export function AccountCard({
  account,
  currency,
}: {
  account: any;
  currency: any;
}) {
  const [mouseOver, setMouseOver] = useState(false);
  const handleMouseEnter = () => setMouseOver(true);
  const handleMouseLeave = () => setMouseOver(false);
  const isRoute = useIsRoute();

  return (
    <Link
      to={`account/${account.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        // TODO: Would it be better to have selected as a property on the array from server?
        (isRoute(`/budget/account/${account.id}`) || mouseOver) &&
          "bg-white/10",
        "flex justify-between items-center gap-4 pl-4 pr-4 py-2 text-sm rounded",
      )}
    >
      <div
        onClick={(e) => {
          e.preventDefault();
        }}
        className="flex justify-center items-center w-5 h-5"
      >
        <Dialog
          onOpenChange={(open) => {
            if (!open) handleMouseLeave();
          }}
        >
          <DialogTrigger asChild>
            {mouseOver && <Pencil className="w-3 h-3 hover:opacity-30" />}
          </DialogTrigger>
          <DialogContent className="w-80">
            <DialogHeader className="space-y-4">
              <DialogTitle className={`text-center ${darkBlueText}`}>
                Edit Account
              </DialogTitle>
            </DialogHeader>
            <div>placeholder Account component</div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grow flex justify-between">
        <p>{account.name}</p>
        <p>{`${currency} ${account.balance}`}</p>
      </div>
    </Link>
  );
}
