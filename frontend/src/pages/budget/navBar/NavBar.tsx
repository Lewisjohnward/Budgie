import { BankIcon, ClipboardIcon, MoneyNoteIcon } from "@/core/icons/icons";
import { useNavbar } from "./hooks/useNavBar";
import {
  Layout,
  Menu,
  NavbarItem,
  AccountOverview,
  ToggleMenu,
} from "./components";
import { useIsRoute } from "./hooks/useIsRoute";

export default function Navbar() {
  const { navbar } = useNavbar();
  const isRoute = useIsRoute();

  return (
    <Layout
      open={navbar.open}
      menu={<Menu displayText={navbar.open} animate={navbar.animateIcon} />}
      items={
        <>
          <NavbarItem
            to={"allocation"}
            displayText={navbar.open}
            selected={isRoute("/budget/allocation")}
            icon={<MoneyNoteIcon />}
            text={"Budget"}
          />
          <NavbarItem
            to={"reflect"}
            displayText={navbar.open}
            selected={isRoute("/budget/reflect")}
            icon={<ClipboardIcon />}
            text={"Reflect"}
          />
          <NavbarItem
            to={"account/all"}
            displayText={navbar.open}
            selected={isRoute("/budget/account/all")}
            icon={<BankIcon />}
            text={"All Accounts"}
          />
        </>
      }
      accounts={
        navbar.open && (
          <AccountOverview
            expanded={navbar.accountsExpanded}
            toggleExpanded={navbar.toggleAccountsExpanded}
          />
        )
      }
      toggleButton={
        <ToggleMenu open={navbar.open} toggle={navbar.toggleOpen} />
      }
    ></Layout>
  );
}
