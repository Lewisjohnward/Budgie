import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CategoryActionTarget } from "../../../hooks/useAllocation/useAllocation";

type Position = {
  x: number;
  y: number;
};

type ContextMenuReturn = {
  target: CategoryActionTarget | null;
  menuPosition: Position;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  open: (e: React.MouseEvent, target: CategoryActionTarget) => void;
  close: () => void;
};

const MENU_OFFSET_X = 30;

export const useContextMenu = (): ContextMenuReturn => {
  const [target, setTarget] = useState<CategoryActionTarget | null>(null);
  const [menuPosition, setMenuPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const menuRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const open = (e: React.MouseEvent, target: CategoryActionTarget) => {
    e.preventDefault();

    setTarget(target);

    setMenuPosition({
      x: e.clientX + MENU_OFFSET_X,
      y: e.clientY,
    });
  };

  const close = () => {
    setTarget(null);
  };

  useLayoutEffect(() => {
    if (!target || !menuRef.current) return;

    const menuHeight = menuRef.current.getBoundingClientRect().height;

    setMenuPosition((current) => ({
      ...current,
      y: current.y - menuHeight / 2,
    }));
  }, [target]);

  useEffect(() => {
    if (!target) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    const handleResize = () => {
      close();
    };

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      close();
    };

    overlay.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      overlay.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [target]);

  return {
    target,
    menuPosition,
    menuRef,
    overlayRef,
    open,
    close,
  };
};
