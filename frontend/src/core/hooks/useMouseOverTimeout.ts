import { useState } from "react";

export default function useMouseOverTimeout(time?: number) {
  const [mouseOver, setMouseOver] = useState(false);
  const timeout = time || 500;

  const handleMouseOver = () => {
    setMouseOver(true);

    setTimeout(() => {
      setMouseOver(false);
    }, timeout);
  };

  return { mouseOver, handleMouseOver };
}
