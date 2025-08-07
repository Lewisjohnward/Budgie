import { ChevronDownIcon } from "@/core/icons/icons";
import { AccountCard, AddAccountBtn, EmptyAccountsMessage } from ".";
import { Balance } from "./Balance";
import { useAccounts } from "../hooks/useAccounts";

export function AccountOverview() {
  const { userHasAccounts, accounts, balance } = useAccounts();

  const currency = "£";

  // TODO: need to handle mutiple accounts with sum of money
  // TODO: handle negative numbers
  // TODO: persist expanded close budget state when opening navbar

  return (
    <div className="space-y-2 w-60">
      {userHasAccounts ? (
        <div className="space-y-2">
          {accounts.cash.hasAccounts && (
            <>
              <button
                onClick={accounts.cash.toggleExpanded}
                className="flex items-center justify-between pr-2 gap-2 w-full"
                data-testid="expand-accounts"
              >
                <div className="flex items-center gap-2 tracking-wider">
                  <ChevronDownIcon
                    className={accounts.cash.expanded ? "" : "-rotate-90"}
                  />
                  <p className="text-sm font-[400]">CASH</p>
                </div>
                <Balance balance={balance} />
              </button>
              {accounts.cash.expanded && (
                <div className="space-y-2">
                  {accounts.cash.accounts.map((account) => (
                    <AccountCard account={account} currency={currency} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <EmptyAccountsMessage />
      )}
      <AddAccountBtn />
    </div>
  );
}
