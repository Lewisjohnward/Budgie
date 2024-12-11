import { ChevronDownIcon } from "@/core/icons/icons";
import { mockAccounts } from "@/mockData";
import { useState } from "react";
import { AccountCard, AddAccountBtn, EmptyAccountsMessage } from ".";

export function AccountOverview() {
  const accounts = mockAccounts;
  const currency = "£";
  const [open, setOpen] = useState(false);
  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const sum = "120.00";

  // TODO: need to handle mutiple accounts with sum of money
  // TODO: handle negative numbers
  // TODO: persist open close budget state when opening navbar

  return (
    <div className="space-y-2 w-60">
      <div className="flex flex-col"></div>
      {accounts.length > 0 ? (
        <div className="space-y-2">
          <button
            onClick={toggleOpen}
            className="flex items-center justify-between px-4 gap-2 w-full"
          >
            <div className="flex items-center gap-2 tracking-wider">
              {open ? (
                // TODO: move into own component open prop?
                <ChevronDownIcon />
              ) : (
                <ChevronDownIcon className="-rotate-90" />
              )}
              <p>BUDGET</p>
            </div>
            <p className="min-w-max">{`${currency} ${sum}`}</p>
          </button>
          {open && (
            <div className="space-y-2">
              {accounts.map((account) => (
                <AccountCard account={account} currency={currency} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyAccountsMessage />
      )}
      <AddAccountBtn />
    </div>
  );
}
