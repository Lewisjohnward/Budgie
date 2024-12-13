import { useState } from "react";

export function useNavbar() {
  const [open, setOpen] = useState(window.innerWidth > 400);
  const [animateIcon, setAnimateIcon] = useState(false);
  const [accountsExpanded, setAccountsExpanded] = useState(false);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    setAnimateIcon(true);

    setTimeout(() => {
      setAnimateIcon(false);
    }, 300);
  };

  const toggleAccountsExpanded = () => setAccountsExpanded((prev) => !prev);

  return {
    navbar: {
      open,
      toggleOpen,
      animateIcon,
      accountsExpanded,
      toggleAccountsExpanded,
    },
  };
}
