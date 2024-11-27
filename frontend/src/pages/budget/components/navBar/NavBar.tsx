import clsx from "clsx";
import { forwardRef, ReactNode } from "react";
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
import { darkBlueBg } from "@/core/theme/colors";
import { Link } from "react-router-dom";
import { useNavbar } from "./hooks/useNavBar";
import useMouseOver from "@/core/hooks/useMouseOver";

import { LogOut, User } from "lucide-react";
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
            to={"#"}
            open={navbar.open}
            selected={true}
            icon={<MoneyNoteIcon />}
            text={"Budget"}
          />
          <NavbarItem
            to={"#"}
            open={navbar.open}
            selected={false}
            icon={<ClipboardIcon />}
            text={"Reflect"}
          />
          <NavbarItem
            to={"#"}
            open={navbar.open}
            selected={false}
            icon={<BankIcon />}
            text={"All Accounts"}
          />
        </>
      }
      noAccountMessage={navbar.open && <NoAccountMessage />}
      button={navbar.open && <AddAccountBtn />}
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
  noAccountMessage,
  open,
  button,
}: {
  menu: ReactNode;
  items: ReactNode;
  toggleButton: ReactNode;
  noAccountMessage: ReactNode;
  button: ReactNode;
  open: boolean;
}) {
  return (
    <div
      className={clsx(
        open ? "w-64" : "w-16",
        `flex flex-col justify-between gap-1 h-full py-4 px-2 ${darkBlueBg} text-white select-none transition-[width] duration-300`,
      )}
    >
      <div className="space-y-4">
        {menu}
        <div className="space-y-1">{items}</div>
        <div className="space-y-2">
          {noAccountMessage}
          {button}
        </div>
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
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => console.log("navbar - user button")}>
            <User />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
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

function NoAccountMessage() {
  return (
    <div className={clsx("px-2 py-2 bg-white/10 rounded text-sm")}>
      <div className="w-56">
        <p className="font-semibold">No Accounts</p>
        <p>
          You can't budget without adding accounts to YNAB first. How about
          adding one now?
        </p>
      </div>
    </div>
  );
}

function AddAccountBtn() {
  const { mouseOver, handleMouseOver } = useMouseOver();
  return (
    <button
      onMouseEnter={handleMouseOver}
      className="flex items-center  py-1 pl-1 pr-4 rounded bg-white/10 hover:bg-white/10"
    >
      <div className="flex items-center w-32">
        <AddIcon className={clsx(mouseOver && "animate-shake", "h-6 w-6")} />
        {true && <p className="text-md">Add Account</p>}
      </div>
    </button>
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
