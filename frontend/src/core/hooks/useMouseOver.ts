import { useState } from "react";

export default function useMouseOver() {
  const [mouseOver, setMouseOver] = useState(false);
  const handleMouseEnter = () => setMouseOver(true);
  const handleMouseLeave = () => setMouseOver(false);

  return { mouseOver, handleMouseEnter, handleMouseLeave };
}
