import { ChevronDownIcon } from "@/core/icons/icons";
import { mockAccounts } from "@/mockData";
import { AccountCard, AddAccountBtn, EmptyAccountsMessage } from ".";
import { useGetAccountsQuery } from "@/core/api/budgetApiSlice";

export function AccountOverview({
  expanded,
  toggleExpanded,
}: {
  expanded: boolean;
  toggleExpanded: () => void;
}) {
  const { data, isLoading, isError } = useGetAccountsQuery();
  // const accounts = mockAccounts;
  const currency = "£";

  const sum = "120.00";

  // TODO: need to handle mutiple accounts with sum of money
  // TODO: handle negative numbers
  // TODO: persist expanded close budget state when opening navbar

  if (isLoading) {
    return <div>loading</div>;
  }
  const accounts = Object.values(data.data.accounts);

  return (
    <div className="space-y-2 w-60">
      <div className="flex flex-col"></div>
      {accounts.length > 0 ? (
        <div className="space-y-2">
          <button
            onClick={toggleExpanded}
            className="flex items-center justify-between px-4 gap-2 w-full"
            data-testid="expand-accounts"
          >
            <div className="flex items-center gap-2 tracking-wider">
              {expanded ? (
                // TODO: move into own component expanded prop?
                <ChevronDownIcon />
              ) : (
                <ChevronDownIcon className="-rotate-90" />
              )}
              <p>BUDGET</p>
            </div>
            <p className="min-w-max">{`${currency} ${sum}`}</p>
          </button>
          {expanded && (
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
