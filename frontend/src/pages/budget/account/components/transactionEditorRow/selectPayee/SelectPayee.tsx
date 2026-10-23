import { ChevronDown, CirclePlus } from "lucide-react";
import { MdOutlineManageAccounts } from "react-icons/md";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { PopoverArrow } from "@radix-ui/react-popover";
import { Separator } from "@/pages/budget/account/components/Separator";
import clsx from "clsx";
import { SelectPayeeModel } from "./useSelectPayee";

// stories
// overflow payees with lots of payees
// create new payee button
// no input
// large input

// tests
// when input is empty and no payees or other accounts - popover doesn't open on focus
// when input is empty and there are payees or other accounts - popover opens on focus
// when input is not empty and no payees or other accounts
// when input doesn't match any current account or payee - display add button

// TODO:(lewis 2025-11-28 10:30) need a way to focus the input and open popover but also close when focus goes to category input

type SelectPayeeProps = {
  selectPayee: SelectPayeeModel;
};

export function SelectPayee({ selectPayee }: SelectPayeeProps) {
  const {
    input,
    filteredPayees,
    filteredAccounts,
    select,
    openManagePayeesDialog,

    // TODO:(lewis 2025-12-06 10:30) replace calles with popover.X
    popover: { isOpen, open, close },
  } = selectPayee;

  const showAccountsHeader = !input.isNoMatch && filteredAccounts.length > 0;
  const showPayeesHeader = !input.isNoMatch && filteredPayees.length > 0;
  const showAddPayeesMessage = input.isIdle && filteredPayees.length === 0;

  const handlePointerDownOutside = (e: Event) => {
    // Don't close if clicking the input
    if (input.ref.current?.contains(e.target as Node)) {
      e.preventDefault();
      return;
    }
    close();
  };

  return (
    <Popover open={isOpen}>
      <PopoverTrigger className="w-full" asChild>
        <div className="flex items-center pr-2 bg-white ring-[1px] focus-visible:ring-sky-700 ring-sky-700 rounded-sm overflow-hidden">
          <input
            ref={input.ref}
            className="px-2 w-full rounded-sm text-ellipsis focus:outline-none focus:ring-0"
            placeholder="Payee"
            onFocus={open}
            value={input.value}
            onChange={input.onChange}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                close();
              }
            }}
          />
          <ChevronDown className="size-4 text-sky-950" />
        </div>
      </PopoverTrigger>

      <PopoverContent
        // TODO:(lewis 2025-12-04 20:43) this should never be focusable - when selecting payee should focus the next input - up down arrows should select
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={handlePointerDownOutside}
        className="flex flex-col h-[275px] w-[350px] text-sm border border-white"
      >
        <PopoverArrow
          className="w-8 h-2 fill-white"

        // TODO:(lewis 2025-12-04 10:27) can the below boolean be improved ? - as a cursory i think so
        />

        {(input.isFiltering || input.isNoMatch) && (
          <CreatePayeeButton
            input={input.value}
            isNoMatch={input.isNoMatch}
            // onClick={handleSelectPayee}
            onClick={() => { }}
          />
        )}
        <div className={clsx("flex-1 flex flex-col justify-between")}>
          {/* account + payees */}
          <div
            className={clsx(
              input.isFiltering || input.isNoMatch ? "h-[190px]" : "h-[235px]",
              input.isNoMatch ? "pt-0" : "pt-2",
              "overflow-auto"
            )}
          >
            {/* accounts  -- extract*/}
            <div className="text-gray-700">
              {showAccountsHeader && (
                <p className="px-4 font-[500]">Payments and Transfers</p>
              )}
              <div>
                {filteredAccounts.map((account) => (
                  <button
                    key={account.name}
                    className="block px-6 py-1 w-full text-left hover:bg-neutral-100 text-neutral-800"
                    onClick={() =>
                      select({
                        name: account.name,
                        id: "",
                        type: "account",
                      })
                    }
                  >
                    To/From {account.name}
                  </button>
                ))}
              </div>
            </div>
            {/* accounts  -- extract*/}

            {/* payees  -- extract*/}
            <div className="flex flex-col">
              {input.isNoMatch && (
                <p className="pt-2 px-6">
                  "{input.value}" will be created as payee
                </p>
              )}

              {showPayeesHeader && (
                <p className="px-4 font-[500]">Saved Payees</p>
              )}

              <div>
                {showAddPayeesMessage ? (
                  <p className="px-6 py-1 text-neutral-600">
                    Start typing to add a payee
                  </p>
                ) : (
                  filteredPayees.map((payee) => (
                    <button
                      key={payee.name}
                      className="block px-6 py-1 w-full text-left hover:bg-neutral-100 text-neutral-600"
                      onClick={() =>
                        select({
                          name: payee.name,
                          id: "",
                          type: "payee",
                        })
                      }
                    >
                      {payee.name}
                    </button>
                  ))
                )}
              </div>
              {/* payees  -- extract*/}
            </div>
          </div>
          <div>
            <Separator />
            <ManagePayeesButton onClick={openManagePayeesDialog} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type CreatePayeeButtonProps = {
  input: string;
  isNoMatch: boolean;
  onClick: () => void;
};

function CreatePayeeButton({
  input,
  isNoMatch,
  onClick,
}: CreatePayeeButtonProps) {
  return (
    <div>
      <div className="p-1">
        <button
          className={clsx(
            isNoMatch ? "bg-neutral-100" : "hover:text-sky-600",
            "flex items-center gap-2 h-[35px] px-4 py-2 text-left text-sky-700"
          )}
          onClick={onClick}
        >
          <CirclePlus size={15} />
          Create "{input}" Payee
        </button>
      </div>
      <Separator />
    </div>
  );
}

type ManagePayeesButtonProps = {
  onClick: () => void;
};

function ManagePayeesButton({ onClick }: ManagePayeesButtonProps) {
  return (
    <div className="px-4 py-2 text-sky-950">
      <button onClick={onClick} className="flex items-center gap-2">
        <MdOutlineManageAccounts className="text-sky-950" />
        <span className="text-sky-700">Manage Payees</span>
      </button>
    </div>
  );
}
