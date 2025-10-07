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
import { MdOutlineManageAccounts } from "react-icons/md";
import { MenuButton } from "./MenuButton";
import { logOut } from "@/core/slices/authSlice";
import { useLogoutMutation } from "@/core/api/authApiSlice";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { toggleManagePayees } from "@/core/slices/dialogSlice";
import { apiSlice } from "@/core/api/apiSlice";

// TODO: Hookup Navigate to settings button

export function Menu({
  displayText,
  animate,
}: {
  displayText: boolean;
  animate: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MenuButton animate={animate} displayText={displayText} />
      </DropdownMenuTrigger>
      <MenuContent />
    </DropdownMenu>
  );
}

// TODO: maybe extract out dropdown menu and pass button and modalContent?

const useMenuActions = () => {
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  async function handleLogout() {
    dispatch(logOut());
    logout();
    dispatch(apiSlice.util.resetApiState());
  }
  const toggleDialog = () => dispatch(toggleManagePayees());
  return { handleLogout, toggleDialog };
};

export function MenuContent() {
  const { handleLogout, toggleDialog } = useMenuActions();
  return (
    <DropdownMenuContent className="w-56 caret-transparent">
      <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => console.log("navbar - user button")}>
          <User />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleDialog}>
          <MdOutlineManageAccounts />
          <span>Manage Payees</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}
