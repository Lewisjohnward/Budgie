import { BankIcon, ClipboardIcon, MoneyNoteIcon } from "@/core/icons/icons";
import { useNavbar } from "./hooks/useNavBar";
import {
  Layout,
  Menu,
  NavbarItem,
  AccountOverview,
  ToggleMenu,
} from "./components";

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
      accounts={navbar.open && <AccountOverview />}
      toggleButton={
        <ToggleMenu open={navbar.open} toggle={navbar.toggleOpen} />
      }
    ></Layout>
  );
}
