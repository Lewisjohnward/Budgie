import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContextMenu } from "./ContextMenu";
import type { CategoryActionTarget } from "../hooks/useAllocation/useAllocation";
import { CategoryGroupId, CategoryId } from "../types/types";

const createCategoryTarget = (
  overrides: Partial<Extract<CategoryActionTarget, { type: "category" }>> = {}
): Extract<CategoryActionTarget, { type: "category" }> => ({
  type: "category",
  id: "category-1" as CategoryId,
  name: "Food",
  categoryGroupId: "group-1" as CategoryGroupId,
  ...overrides,
});

const createCategoryGroupTarget = (
  overrides: Partial<
    Extract<CategoryActionTarget, { type: "categoryGroup" }>
  > = {}
): Extract<CategoryActionTarget, { type: "categoryGroup" }> => ({
  type: "categoryGroup",
  id: "group-1" as CategoryGroupId,
  name: "Bills",
  ...overrides,
});

describe("ContextMenu", () => {
  const renderContextMenu = (
    overrides: Partial<React.ComponentProps<typeof ContextMenu>> = {}
  ) => {
    const target = overrides.target ?? createCategoryTarget();

    const props: React.ComponentProps<typeof ContextMenu> = {
      target,
      position: {
        x: 100,
        y: 200,
      },
      menuRef: { current: null },
      overlayRef: { current: null },
      canRename: vi.fn().mockReturnValue(true),
      onRename: vi.fn(),
      onDelete: vi.fn(),
      onClose: vi.fn(),
      ...overrides,
    };

    return {
      ...render(<ContextMenu {...props} />),
      props,
    };
  };

  it("renders the current name", () => {
    renderContextMenu();

    expect(
      screen.getByRole("textbox", { name: "Rename category" })
    ).toHaveValue("Food");
  });

  it("disables OK when the name has not changed", () => {
    renderContextMenu();

    expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();
  });

  it("enables OK when the name is changed", async () => {
    const user = userEvent.setup();

    renderContextMenu();

    const input = screen.getByRole("textbox", {
      name: "Rename category",
    });

    await user.clear(input);
    await user.type(input, "Groceries");

    expect(screen.getByRole("button", { name: "OK" })).toBeEnabled();
  });

  it("disables OK when the name is empty", async () => {
    const user = userEvent.setup();

    renderContextMenu();

    const input = screen.getByRole("textbox", {
      name: "Rename category",
    });

    await user.clear(input);

    expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();
  });

  it("does not submit when the name is empty", async () => {
    const user = userEvent.setup();

    const onRename = vi.fn();
    const onClose = vi.fn();

    renderContextMenu({
      onRename,
      onClose,
    });

    const input = screen.getByRole("textbox", {
      name: "Rename category",
    });

    await user.clear(input);
    await user.keyboard("{Enter}");

    expect(onRename).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("uses category group labels for a category group target", () => {
    renderContextMenu({
      target: createCategoryGroupTarget(),
    });

    expect(
      screen.getByRole("textbox", {
        name: "Rename category group",
      })
    ).toHaveValue("Bills");
  });
});
