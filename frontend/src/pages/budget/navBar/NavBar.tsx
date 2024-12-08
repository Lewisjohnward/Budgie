import clsx from "clsx";
import { forwardRef, ReactNode, useState } from "react";
import { cn } from "@/core/lib/utils";
import {
  BankIcon,
  BirdIcon,
  ArrowIcon,
  ClipboardIcon,
  ChevronDownIcon,
  MoneyNoteIcon,
  AddIcon,
} from "@/core/icons/icons";
import { darkBlueBg, darkBlueText } from "@/core/theme/colors";
import { Link } from "react-router-dom";
import { useNavbar } from "./hooks/useNavBar";
import useMouseOver from "@/core/hooks/useMouseOver";

import { LogOut, Pencil, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/core/components/uiLibrary/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/uiLibrary/dialog";
import { AddAccount } from "@/core/components/AddAccountForm";

const mockAccounts = [
  {
    id: "595812dc-fa03-4def-85ae-a24d92dfee1c",
    userId: "08eeeb07-8932-49b5-a5d9-ea55f888c0e1",
    name: "Halifax",
    type: "BANK",
    // TODO: this false is not coming from the db
    selected: false,
    balance: "120.00",
    createdAt: "2024-11-29T09:09:42.232Z",
    updatedAt: "2024-11-29T09:09:42.232Z",
    transactions: [
      {
        id: "3bbf025e-01ad-4dcd-8094-d230eb3b62ec",
        accountId: "595812dc-fa03-4def-85ae-a24d92dfee1c",
        categoryId: "25678c61-b29c-45b7-84a2-941430375462",
        budgetId: "93362012-e02d-4d26-a9fc-da4e8d4c6cde",
        amount: "12.5",
        date: "2024-11-29T09:09:42.242Z",
        payee: "Supermart",
        memo: "Chicken thighs, mince",
        cleared: false,
        createdAt: "2024-11-29T09:09:42.242Z",
        updatedAt: "2024-11-29T09:09:42.242Z",
      },
      {
        id: "5f39b028-1e12-4e64-9c3a-c0e061c9ff56",
        accountId: "595812dc-fa03-4def-85ae-a24d92dfee1c",
        categoryId: "25678c61-b29c-45b7-84a2-941430375462",
        budgetId: "93362012-e02d-4d26-a9fc-da4e8d4c6cde",
        amount: "0.8",
        date: "2024-11-29T09:09:42.242Z",
        payee: "M&S",
        memo: "Sparkling water",
        cleared: false,
        createdAt: "2024-11-29T09:09:42.242Z",
        updatedAt: "2024-11-29T09:09:42.242Z",
      },
    ],
  },
  {
    id: "585812dc-fa03-4def-85ae-a24d92dfee1c",
    userId: "08eeeb07-8932-49b5-a5d9-ea55f888c0e1",
    name: "Natwest",
    type: "BANK",
    // TODO: this false is not coming from the db
    selected: false,
    balance: "0.00",
    createdAt: "2024-11-29T09:09:42.232Z",
    updatedAt: "2024-11-29T09:09:42.232Z",
    transactions: [],
  },
];

export default function Navbar({ logout }: { logout: () => void }) {
  const { navbar } = useNavbar();

  return (
    <Layout
      open={navbar.open}
      menu={
        <Menu
          displayText={navbar.open}
          animate={navbar.animateIcon}
          logout={logout}
        />
      }
      items={
        <>
          <NavbarItem
            to={"allocation"}
            open={navbar.open}
            selected={true}
            icon={<MoneyNoteIcon />}
            text={"Budget"}
          />
          <NavbarItem
            to={"reflect"}
            open={navbar.open}
            selected={false}
            icon={<ClipboardIcon />}
            text={"Reflect"}
          />
          <NavbarItem
            to={"account/all"}
            open={navbar.open}
            selected={false}
            icon={<BankIcon />}
            text={"All Accounts"}
          />
        </>
      }
      accounts={navbar.open && <Accounts />}
      toggleButton={
        <ToggleMenu open={navbar.open} toggle={navbar.toggleOpen} />
      }
    ></Layout>
  );
}

function Layout({
  menu,
  items,
  toggleButton,
  accounts,
  open,
}: {
  menu: ReactNode;
  items: ReactNode;
  toggleButton: ReactNode;
  accounts: ReactNode;
  open: boolean;
}) {
  return (
    <div
      className={clsx(
        open ? "w-64" : "w-16",
        `flex flex-col justify-between gap-1 h-full py-4 px-2 caret-transparent ${darkBlueBg} text-white select-none transition-[width] duration-300`,
      )}
    >
      <div className="space-y-4">
        {menu}
        <div className="space-y-1">{items}</div>
        <div className="space-y-2">{accounts}</div>
      </div>

      <div
        className={clsx(
          open ? "pr-0" : "pr-2",
          "flex justify-end transition-[padding] duration-300",
        )}
      >
        {toggleButton}
      </div>
    </div>
  );
}

// TODO: Navigate to settings button

function Menu({
  displayText,
  animate,
  logout,
}: {
  displayText: boolean;
  animate: boolean;
  logout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MenuButton animate={animate} displayText={displayText} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 caret-transparent">
        <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => console.log("navbar - user button")}>
            <User />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type MenuBottonProps = {
  animate: boolean;
  displayText: boolean;
};

const MenuButton = forwardRef<HTMLButtonElement, MenuBottonProps>(
  ({ displayText, animate, ...props }, ref) => {
    const { mouseOver, handleMouseOver } = useMouseOver();

    return (
      <button
        className="flex justify-between items-center gap-4 w-full h-14 px-2 rounded hover:bg-white/10"
        onMouseEnter={handleMouseOver}
        ref={ref}
        {...props}
      >
        <div className="flex flex-row items-center gap-2">
          <BirdIcon
            className={clsx(
              animate || mouseOver ? "animate-shake" : "",
              "h-8 w-8",
            )}
          />
          {displayText && (
            <div>
              <p className="text-left font-bold">budget</p>
              <p className="text-xs text-white/70">placeholder@email.com</p>
            </div>
          )}
        </div>
        {displayText && <ChevronDownIcon />}
      </button>
    );
  },
);

type NavBarItemProps = {
  to: string;
  selected: boolean;
  icon: React.ReactNode;
  text: string;
  open: boolean;
  className?: string;
};

function NavbarItem({
  to,
  selected,
  className,
  icon,
  text,
  open,
}: NavBarItemProps) {
  const { mouseOver, handleMouseOver } = useMouseOver();

  return (
    <Link
      to={to}
      onMouseOver={handleMouseOver}
      className={cn(
        clsx(
          selected && "bg-white/10 cursor-auto",
          "w-full flex items-center gap-2 rounded px-4 py-2 h-10 hover:bg-white/10 select-none",
          className,
        ),
      )}
    >
      <div
        className={clsx(mouseOver && !selected && "animate-shake", "min-w-fit")}
      >
        {icon}
      </div>
      <p className="min-w-max">{open && text}</p>
    </Link>
  );
}

function Accounts() {
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
                <Account account={account} currency={currency} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <NoAccountMessage />
      )}
      <AddAccountBtn />
    </div>
  );
}

// TODO: HANDLE THE ROUTING ON THE NAVBAR WHEN EACH PAAGE IS OPEN
// TODO: MAYBE SPLIT UP THE NAVBAR COMPONENTS
// TODO: FIX TYPING OF Account component

function Account({ account, currency }: { account: any; currency: any }) {
  const [mouseOver, setMouseOver] = useState(false);
  const handleMouseEnter = () => setMouseOver(true);
  const handleMouseLeave = () => setMouseOver(false);

  return (
    <Link
      to={`account/${account.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        (account.selected || mouseOver) && "bg-white/10",
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

function NoAccountMessage() {
  return (
    <div className="space-y-2">
      <div className={clsx("px-2 py-2 bg-white/10 rounded text-sm")}>
        <div className="w-56">
          <p className="font-semibold">No Accounts</p>
          <p>
            You can't budget without adding accounts to YNAB first. How about
            adding one now?
          </p>
        </div>
      </div>
    </div>
  );
}

function AddAccountBtn() {
  const { mouseOver, handleMouseOver } = useMouseOver();
  return (
    <Dialog>
      <DialogTrigger
        onMouseEnter={handleMouseOver}
        className="flex items-center py-1 pl-1 pr-3 ml-2 rounded bg-white/10 hover:bg-white/20"
      >
        <div className="flex items-center gap-1">
          <AddIcon className={clsx(mouseOver && "animate-shake", "h-6 w-6")} />
          {true && <p className="text-sm">Add Account</p>}
        </div>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        className="w-80"
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

function ToggleMenu({
  open,
  toggle: toggleOpen,
}: {
  open: boolean;
  toggle: () => void;
}) {
  return (
    <button
      className={clsx(
        open ? "rotate-0" : "rotate-180",
        "max-w-fit transition-transform duration-300",
      )}
      onClick={toggleOpen}
    >
      <ArrowIcon className="w-8 h-8 text-white/80 hover:text-white" />
    </button>
  );
}
