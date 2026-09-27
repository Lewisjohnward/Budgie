import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CategoryActionTarget } from "../../../hooks/useAllocation/useAllocation";

type Position = {
  x: number;
  y: number;
};

export type MenuPlacement = "left" | "right" | "above";

type ContextMenuReturn = {
  target: CategoryActionTarget | null;
  menuPosition: Position;
  menuPlacement: MenuPlacement;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  open: (e: React.MouseEvent, target: CategoryActionTarget) => void;
  close: () => void;
};

const MENU_OFFSET = 24;
const MENU_EDGE_PADDING = 16;
const BOTTOM_THRESHOLD = 0.8;

export const useContextMenu = (): ContextMenuReturn => {
  const [target, setTarget] = useState<CategoryActionTarget | null>(null);

  const [cursorPosition, setCursorPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [menuPosition, setMenuPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [menuPlacement, setMenuPlacement] = useState<MenuPlacement>("right");

  const menuRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const open = (e: React.MouseEvent, target: CategoryActionTarget) => {
    e.preventDefault();

    setTarget(target);

    setCursorPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const close = () => {
    setTarget(null);
  };

  useLayoutEffect(() => {
    if (!target || !menuRef.current) return;

    const { width, height } = menuRef.current.getBoundingClientRect();

    const isInBottomTwentyPercent =
      cursorPosition.y >= window.innerHeight * BOTTOM_THRESHOLD;

    if (isInBottomTwentyPercent) {
      const x = clamp(
        cursorPosition.x - width / 2,
        MENU_EDGE_PADDING,
        window.innerWidth - width - MENU_EDGE_PADDING
      );

      const y = Math.max(
        MENU_EDGE_PADDING,
        cursorPosition.y - height - MENU_OFFSET
      );

      setMenuPlacement("above");
      setMenuPosition({ x, y });

      return;
    }

    const rightPosition = cursorPosition.x + MENU_OFFSET;
    const leftPosition = cursorPosition.x - MENU_OFFSET - width;

    const fitsRight =
      rightPosition + width <= window.innerWidth - MENU_EDGE_PADDING;

    const fitsLeft = leftPosition >= MENU_EDGE_PADDING;

    if (fitsRight) {
      setMenuPlacement("right");
      setMenuPosition({
        x: rightPosition,
        y: getVerticalPosition(cursorPosition.y, height),
      });
      return;
    }

    if (fitsLeft) {
      setMenuPlacement("left");
      setMenuPosition({
        x: leftPosition,
        y: getVerticalPosition(cursorPosition.y, height),
      });
      return;
    }

    setMenuPlacement("right");
    setMenuPosition({
      x: Math.max(
        MENU_EDGE_PADDING,
        Math.min(rightPosition, window.innerWidth - width - MENU_EDGE_PADDING)
      ),
      y: getVerticalPosition(cursorPosition.y, height),
    });
  }, [target, cursorPosition]);

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
    menuPlacement,
    menuRef,
    overlayRef,
    open,
    close,
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const getVerticalPosition = (cursorY: number, height: number) =>
  Math.max(
    MENU_EDGE_PADDING,
    Math.min(
      cursorY - height / 2,
      window.innerHeight - height - MENU_EDGE_PADDING
    )
  );
