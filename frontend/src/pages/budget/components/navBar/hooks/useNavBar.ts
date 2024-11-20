import { useState } from "react";

export function useNavbar() {
  const [open, setOpen] = useState(window.innerWidth > 400);
  const [animateIcon, setAnimateIcon] = useState(false);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    setAnimateIcon(true);

    setTimeout(() => {
      setAnimateIcon(false);
    }, 300);
  };

  return { navbar: { open, toggleOpen, animateIcon } };
}
