// TODO: HANDLE THE ROUTING ON THE NAVBAR WHEN EACH PAAGE IS OPEN
// TODO: MAYBE SPLIT UP THE NAVBAR COMPONENTS
// TODO: FIX TYPING OF Account component

import clsx from "clsx";
import { Dot, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsRoute } from "../hooks/useIsRoute";
import useMouseOver from "@/core/hooks/useMouseOver";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Account } from "@/core/types/NormalizedData";
import { Balance } from "./Balance";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { toggleEditAccount } from "@/core/slices/dialogSlice";

export function AccountCard({
  account,
  currency,
}: {
  account: Account;
  currency: any;
}) {
  const { mouseOver, handleMouseEnter, handleMouseLeave } = useMouseOver();
  const dispatch = useAppDispatch();
  const handleOpenDialog = () => dispatch(toggleEditAccount());
  const isRoute = useIsRoute();

  const active = isRoute(`/budget/account/${account.id}`);
  const hasFundsToAllocate = Math.random() >= 0.5;

  return (
    <Link
      to={`account/${account.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        // TODO: Would it be better to have selected as a property on the array from server?
        (active || mouseOver) && "bg-white/10",
        "flex justify-between items-center gap-4 pl-4 pr-2 py-2 text-sm rounded",
      )}
    >
      <div
        onClick={handleOpenDialog}
        className="relative flex justify-center items-center w-5 h-5"
      >
        {mouseOver ? (
          <Pencil className="w-3 h-3 hover:opacity-30" />
        ) : hasFundsToAllocate ? (
          <Dot size={40} className="absolute" />
        ) : null}
      </div>
      <div className="relative grow flex justify-between">
        <p>{account.name}</p>
        <Balance balance={account.balance} />
      </div>
    </Link>
  );
}
