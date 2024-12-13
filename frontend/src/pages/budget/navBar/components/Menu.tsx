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
import { MenuButton } from "./MenuButton";
import { logOut } from "@/core/auth/authSlice";
import { useLogoutMutation } from "@/core/api/authApiSlice";
import { useAppDispatch } from "@/core/hooks/reduxHooks";

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
  }
  return { handleLogout };
};

export function MenuContent() {
  const { handleLogout } = useMenuActions();
  return (
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
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}
