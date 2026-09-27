import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { useContextMenu } from "./useContextMenu";
import { CategoryActionTarget } from "../../../hooks/useAllocation/useAllocation";
import { asCategoryGroupId, asCategoryId } from "../../../types/types";

const target: CategoryActionTarget = {
  type: "category",
  id: asCategoryId("category-1"),
  name: "Food",
  categoryGroupId: asCategoryGroupId("group-1"),
};

const createMouseEvent = (clientX: number, clientY: number) =>
  ({
    preventDefault: () => { },
    clientX,
    clientY,
  }) as React.MouseEvent;

const mockMenuSize = (width: number, height: number) => {
  const menu = document.createElement("div");

  vi.spyOn(menu, "getBoundingClientRect").mockReturnValue({
    width,
    height,
    top: 0,
    right: width,
    bottom: height,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => { },
  });

  return menu;
};

describe("useContextMenu", () => {
  describe("viewport positioning", () => {
    it("places the menu to the right of the cursor when there is room", () => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 1000,
      });

      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useContextMenu());

      const menu = mockMenuSize(384, 200);
      result.current.menuRef.current = menu;

      act(() => {
        result.current.open(createMouseEvent(400, 400), target);
      });

      expect(result.current.menuPlacement).toBe("right");
      expect(result.current.menuPosition.x).toBe(424);
      expect(result.current.menuPosition.y).toBe(300);
    });

    it("places the menu to the left when there is not enough room on the right", () => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 1000,
      });

      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useContextMenu());

      const menu = mockMenuSize(384, 200);
      result.current.menuRef.current = menu;

      act(() => {
        result.current.open(createMouseEvent(950, 400), target);
      });

      expect(result.current.menuPlacement).toBe("left");
      expect(result.current.menuPosition.x).toBe(542);
      expect(result.current.menuPosition.y).toBe(300);
    });

    it("keeps the menu within the viewport when neither horizontal side fits", () => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 500,
      });

      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useContextMenu());

      const menu = mockMenuSize(484, 200);
      result.current.menuRef.current = menu;

      act(() => {
        result.current.open(createMouseEvent(250, 400), target);
      });

      expect(result.current.menuPlacement).toBe("right");
      expect(result.current.menuPosition.x).toBe(16);
      expect(result.current.menuPosition.y).toBe(300);
    });

    it("keeps the menu within the bottom edge of the viewport", () => {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useContextMenu());

      const menu = mockMenuSize(384, 200);
      result.current.menuRef.current = menu;

      act(() => {
        result.current.open(createMouseEvent(400, 790), target);
      });

      expect(result.current.menuPosition.y + 200).toBeLessThanOrEqual(
        window.innerHeight
      );
    });

    it("keeps the menu within the bottom-right corner of the viewport", () => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 1000,
      });

      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useContextMenu());

      const menu = mockMenuSize(384, 200);
      result.current.menuRef.current = menu;

      act(() => {
        result.current.open(createMouseEvent(950, 790), target);
      });

      expect(result.current.menuPosition.y + 200).toBeLessThanOrEqual(
        window.innerHeight
      );
      expect(result.current.menuPosition.y).toBeLessThanOrEqual(600);
    });

    it("places the menu above the cursor in the bottom 20%", () => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 1000,
      });

      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useContextMenu());

      const menu = mockMenuSize(384, 200);
      result.current.menuRef.current = menu;

      act(() => {
        result.current.open(createMouseEvent(500, 700), target);
      });

      expect(result.current.menuPlacement).toBe("above");
      expect(result.current.menuPosition.x).toBe(308);
      expect(result.current.menuPosition.y).toBe(476);
    });

    it("places the menu above the cursor at exactly the bottom 20% threshold", () => {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useContextMenu());

      const menu = mockMenuSize(384, 200);
      result.current.menuRef.current = menu;

      act(() => {
        result.current.open(createMouseEvent(500, 640), target);
      });

      expect(result.current.menuPlacement).toBe("above");
    });

    it("does not place the menu above the cursor just outside the bottom 20%", () => {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() => useContextMenu());

      const menu = mockMenuSize(384, 200);
      result.current.menuRef.current = menu;

      act(() => {
        result.current.open(createMouseEvent(500, 639), target);
      });

      expect(result.current.menuPlacement).toBe("right");
    });
  });
});
