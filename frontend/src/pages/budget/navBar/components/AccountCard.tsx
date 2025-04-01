// TODO: HANDLE THE ROUTING ON THE NAVBAR WHEN EACH PAAGE IS OPEN
// TODO: MAYBE SPLIT UP THE NAVBAR COMPONENTS
// TODO: FIX TYPING OF Account component

import clsx from "clsx";
import { Dot, Pencil } from "lucide-react";
import { NavLink } from "react-router-dom";
import useMouseOver from "@/core/hooks/useMouseOver";
import { Account } from "@/core/types/NormalizedData";
import { Balance } from "./Balance";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { toggleEditAccount } from "@/core/slices/dialogSlice";
import { useGetAccountsQuery } from "@/core/api/budgetApiSlice";
import { useMemo } from "react";

export function useHasUnallocatedTransactions(account: Account) {
  const { data } = useGetAccountsQuery();

  return useMemo(() => {
    return account.transactions.some(
      (transactionId) => !data?.transactions?.[transactionId]?.categoryId,
    );
  }, [account.transactions, data?.transactions]);
}

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
  const hasUnallocatedTransactions = useHasUnallocatedTransactions(account);

  return (
    <NavLink
      to={`account/${account.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={({ isActive }) =>
        clsx(
          (isActive || mouseOver) && "bg-white/10",
          "group flex justify-between items-center gap-4 pl-4 pr-2 py-2 text-sm rounded",
        )
      }
    >
      <div
        onClick={(e) => {
          e.preventDefault();
          handleOpenDialog();
        }}
        className="relative flex justify-center items-center w-5 h-5"
      >
        {mouseOver ? (
          <Pencil className="w-3 h-3 hover:opacity-30" />
        ) : hasUnallocatedTransactions ? (
          <Dot size={40} className="absolute" />
        ) : null}
      </div>
      <div className="relative grow flex justify-between">
        <p>{account.name}</p>
        <Balance balance={account.balance} />
      </div>
    </NavLink>
  );
}
