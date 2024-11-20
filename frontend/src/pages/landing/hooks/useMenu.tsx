import { useEffect, useState } from "react";

export const useMenu = () => {
  const [visible, setVisible] = useState(false);
  const toggle = () => setVisible((prevState) => !prevState);
  useEffect(() => {
    const handleResize = () => window.innerWidth > 768 && setVisible(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menu = {
    visible,
    toggle,
  };

  return { menu };
};
