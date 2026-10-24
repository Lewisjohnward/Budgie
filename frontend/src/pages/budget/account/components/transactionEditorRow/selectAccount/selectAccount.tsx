import { useGetAccountsQuery } from "@/core/api/budget/account/accountApiSlice";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@radix-ui/react-popover";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function SelectAccount() {
  const { data } = useGetAccountsQuery();
  const { setValue, watch } = useFormContext();

  if (!data) return <div>There has been an error</div>;

  const cashAccounts = Object.values(data.accounts).filter(
    (account) => account.type === "BANK"
  );

  const creditAccounts = Object.values(data.accounts).filter(
    (account) => account.type === "CREDIT_CARD"
  );

  const accountId = watch("accountId");

  const handleSelectAccount = (accountId: string) => {
    setValue("accountId", accountId, { shouldDirty: true });
  };

  return (
    <Popover>
      <PopoverTrigger className="w-full">
        <div className="flex items-center pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden">
          <input
            readOnly
            className="px-2 w-full caret-transparent rounded-sm text-ellipsis focus:outline-none focus:ring-0"
            value={data.accounts[accountId]?.name || "Account"}
          />
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] h-[200px] text-sm">
        <PopoverArrow className="w-8 h-2 fill-white" />
        <div className="h-full flex flex-col justify-between">
          <div className="py-2 text-gray-700">
            {cashAccounts.length > 0 && (
              <>
                <p className="px-4 py-2 font-bold text-sm">Cash Accounts</p>
                {cashAccounts.map((account) => (
                  <button
                    key={account.id}
                    className={clsx(
                      "flex w-full px-4 py-2 hover:bg-gray-100 cursor-pointer",
                      account.id === accountId && "bg-gray-100"
                    )}
                    onClick={() => handleSelectAccount(account.id)}
                  >
                    {account.name}
                  </button>
                ))}
              </>
            )}
            {creditAccounts.length > 0 && (
              <>
                <p className="px-4 py-2 font-bold text-sm">Credit Accounts</p>
                {creditAccounts.map((account) => (
                  <button
                    key={account.id}
                    className={clsx(
                      "flex w-full px-4 py-2 hover:bg-gray-100 cursor-pointer",
                      account.id === accountId && "bg-gray-100"
                    )}
                    onClick={() => handleSelectAccount(account.id)}
                  >
                    {account.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
