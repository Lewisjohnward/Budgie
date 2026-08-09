import { useState } from "react";
import { CategoryActionTarget } from "../../../hooks/useAllocation/useAllocation";

export const useContextMenu = () => {
  const [target, setTarget] = useState<CategoryActionTarget | null>(null);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const open = (e: React.MouseEvent, target: CategoryActionTarget) => {
    e.preventDefault();

    setTarget(target);

    setPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const close = () => setTarget(null);

  return {
    target,
    position,
    open,
    close,
  };
};
