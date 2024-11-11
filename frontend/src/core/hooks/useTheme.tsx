import { useState } from "react";
import { darkColors, lightColors } from "../theme/colors";

export default function useTheme() {
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return { colors, currentTheme: theme, toggleTheme };
}

