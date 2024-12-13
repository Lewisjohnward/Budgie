import { BankIcon, ClipboardIcon, MoneyNoteIcon } from "@/core/icons/icons";
import { useNavbar } from "./hooks/useNavBar";
import {
  Layout,
  Menu,
  NavbarItem,
  AccountOverview,
  ToggleMenu,
} from "./components";

export default function Navbar() {
  const { navbar } = useNavbar();

  return (
    <Layout
      open={navbar.open}
      menu={<Menu displayText={navbar.open} animate={navbar.animateIcon} />}
      items={
        <>
          <NavbarItem
            to={"allocation"}
            displayText={navbar.open}
            selected={true}
            icon={<MoneyNoteIcon />}
            text={"Budget"}
          />
          <NavbarItem
            to={"reflect"}
            displayText={navbar.open}
            selected={false}
            icon={<ClipboardIcon />}
            text={"Reflect"}
          />
          <NavbarItem
            to={"account/all"}
            displayText={navbar.open}
            selected={false}
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
