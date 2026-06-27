import { describe, it, expect } from "vitest";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CategoryGroupId, CategoryId } from "../../types/types";
import userEvent from "@testing-library/user-event";

// Modal doesnt close when clicking outside of modal
// Modal closes when clicking cancel
// Modal closes when clicking x button

// Clicking input opens popover
// Clicking input when popover is open doesnt do anything
// Cicling anywhere else when popover is open causes popover to close
// Popover displays categories with correct assigned amount
// Popover is scrollable

// arrow up and down focus next
// delete is disabled if nothing selected
// When focussing the input and the popover appears the top category is selected

function createMocks() {
  return {
    toggle: vi.fn(),
    cancel: vi.fn(),
    accept: vi.fn(),
  };
}

export const defaultSelectOptions = [
  {
    id: "group-1" as CategoryGroupId,
    name: "Important",
    categories: [
      {
        id: "1" as CategoryId,
        name: "Groceries",
        available: 100,
      },
      {
        id: "2" as CategoryId,
        name: "Bills",
        available: 50,
      },
      {
        id: "3" as CategoryId,
        name: "Transport",
        available: 25,
      },
    ],
  },
  {
    id: "group-2" as CategoryGroupId,
    name: "Leisure",
    categories: [
      {
        id: "4" as CategoryId,
        name: "Entertainment",
        available: 200,
      },
      {
        id: "5" as CategoryId,
        name: "Dining Out",
        available: 150,
      },
    ],
  },
];

const defaultProps = {
  open: true,
  state: {
    type: "category" as const,
    name: "Food",
    transactionCount: 5,
    hasAssigned: false,
  },
  selectOptions: defaultSelectOptions,
};

function renderDeleteDialog(overrideProps = {}, mocks = createMocks()) {
  const utils = render(
    <DeleteCategoryDialog {...defaultProps} {...overrideProps} {...mocks} />
  );

  return {
    ...utils,
    mocks,
  };
}

function openPopover() {
  fireEvent.click(screen.getByRole("textbox"));
}

function typeInInput(value: string) {
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value },
  });
}

describe("DeleteCategoryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  // ---------------------------
  // MODAL BEHAVIOUR
  // ---------------------------
  describe("modal behaviour", () => {
    it("disables delete button when no category selected", () => {
      renderDeleteDialog();

      expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
    });
    it("displays the category to be deleted", () => {
      renderDeleteDialog({
        state: {
          type: "category",
          name: "Food",
          transactionCount: 5,
          hasAssigned: false,
        },
      });
      expect(screen.getByText(/food/i)).toBeInTheDocument();
    });
    it("displays number of transactions to be inherited", () => {
      renderDeleteDialog({
        state: {
          type: "category",
          name: "Food",
          transactionCount: 5,
          hasAssigned: false,
        },
      });

      expect(screen.getByText(/all transactions/i)).toBeInTheDocument();
      expect(screen.getByText("[5]")).toBeInTheDocument();
    });
    it("closes modal when cancel is clicked", () => {
      const { mocks } = renderDeleteDialog();

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mocks.cancel).toHaveBeenCalledTimes(1);
    });
    it("closes modal when x is clicked", () => {
      const { mocks } = renderDeleteDialog();

      fireEvent.click(screen.getByRole("button", { name: /close/i }));

      expect(mocks.cancel).toHaveBeenCalledTimes(1);
    });
    it.skip("doesn't close modal when clicking outside", async () => {
      const user = userEvent.setup();
      renderDeleteDialog();

      const dialog = screen.getByRole("dialog");

      const overlay = dialog.parentElement?.querySelector(
        '[aria-hidden="true"][data-state="open"]'
      );

      await user.click(overlay!);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    it.skip("closes modal when pressing escape key", async () => {
      const user = userEvent.setup();
      renderDeleteDialog();

      const dialog = screen.getByRole("dialog");

      await user.keyboard("{Escape}");

      expect(dialog).toBeInTheDocument();
    });
    it.skip("calls delete with categoryId and inheritingCategoryId", async () => {});
  });

  // ---------------------------
  // POPOVER BEHAVIOUR
  // ---------------------------
  describe("category reassign popover", () => {
    it("opens popover when input is clicked", () => {
      renderDeleteDialog();
      openPopover();

      expect(screen.getByText(/important/i)).toBeInTheDocument();
    });
    it("displays correct available amount in popover", () => {
      renderDeleteDialog();
      openPopover();

      expect(screen.getByText(/100\.00/i)).toBeInTheDocument();
    });
    it("first category is selected when popover opens", () => {
      renderDeleteDialog();
      openPopover();

      expect(
        screen.getByRole("option", { name: /groceries/i })
      ).toHaveAttribute("aria-selected", "true");
    });
    it("on blur input closes popover", async () => {
      renderDeleteDialog();
      openPopover();

      const input = screen.getByRole("textbox");

      // ensure popover is open
      expect(screen.getByText(/plan categories/i)).toBeInTheDocument();

      // trigger blur (simulate user leaving input)
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText(/plan categories/i)).not.toBeInTheDocument();
      });
    });
    it("focusing input with click after selection opens popover with all categories and user selected highlighted", async () => {
      renderDeleteDialog();
      openPopover();

      const input = screen.getByRole("textbox");

      // Select anything but first category
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(input).toHaveValue("Important: Bills");

      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });

      openPopover();

      // 1. ASSERT: all groups are visible (not filtered state)
      expect(screen.getByText(/plan categories/i)).toBeInTheDocument();

      // pick multiple categories to prove it's not filtered
      const categories = screen.getAllByRole("option");
      expect(categories.length).toBeGreaterThan(1);

      // 2. ASSERT: selected category is still marked
      const billsOption = screen.getByRole("option", {
        name: /bills/i,
      });

      expect(billsOption).toHaveAttribute("aria-selected", "true");
    });
  });

  // ---------------------------
  //  KEYBOARD BEHAVIOUR
  // ---------------------------
  describe("keyboard navigation", () => {
    it("moves selection down with ArrowDown", () => {
      renderDeleteDialog();
      openPopover();

      const input = screen.getByRole("textbox");

      // ensure initial state is Groceries selected
      expect(
        screen.getByRole("option", { name: /groceries/i })
      ).toHaveAttribute("aria-selected", "true");

      // press ArrowDown
      fireEvent.keyDown(input, { key: "ArrowDown" });

      // now Bills should be selected
      expect(screen.getByRole("option", { name: /bills/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );

      // and Groceries should no longer be selected
      expect(
        screen.getByRole("option", { name: /groceries/i })
      ).toHaveAttribute("aria-selected", "false");
    });
    it("moves selection up with ArrowUp", () => {
      renderDeleteDialog();
      openPopover();

      const input = screen.getByRole("textbox");

      // initial selection should be first item
      expect(
        screen.getByRole("option", { name: /groceries/i })
      ).toHaveAttribute("aria-selected", "true");

      // press ArrowUp → should wrap to last item (Dining Out in your default data)
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(
        screen.getByRole("option", { name: /dining out/i })
      ).toHaveAttribute("aria-selected", "true");

      // Groceries should no longer be selected
      expect(
        screen.getByRole("option", { name: /groceries/i })
      ).toHaveAttribute("aria-selected", "false");
    });
    it("arrow keys dont move cursor position in text box", () => {
      renderDeleteDialog();
      openPopover();

      const input = screen.getByRole("textbox") as HTMLInputElement;

      // Put cursor somewhere in the middle of text
      fireEvent.change(input, { target: { value: "groceries" } });
      input.setSelectionRange(3, 3); // caret at position 3

      const before = input.selectionStart;

      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowUp" });

      const after = input.selectionStart;

      expect(after).toBe(before);
    });
    it("selection wraps around when navigating with arrow keys", () => {
      renderDeleteDialog();
      openPopover();

      const input = screen.getByRole("textbox");

      // ---- DOWN: last → first ----
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(
        screen.getByRole("option", { name: /dining out/i })
      ).toHaveAttribute("aria-selected", "true");

      // ---- UP: first → last ----
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(
        screen.getByRole("option", { name: /groceries/i })
      ).toHaveAttribute("aria-selected", "true");
    });
    it("selecting category with enter doesnt lose focus on input", async () => {
      renderDeleteDialog();
      openPopover();

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Enter" });

      expect(input).toHaveValue("Important: Groceries");

      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });

      expect(screen.queryByText(/plan categories/i)).not.toBeInTheDocument();
    });
  });

  // ---------------------------
  //  FILTER BEHAVIOUR
  // ---------------------------
  describe("filtering behaviour", () => {
    it("filters categories by name", () => {
      renderDeleteDialog();
      openPopover();
      typeInInput("groceries");

      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.queryByText("Bills")).not.toBeInTheDocument();
    });
    it("filters across category groups", () => {
      renderDeleteDialog();
      openPopover();
      typeInInput("din");

      expect(screen.getByText("Dining Out")).toBeInTheDocument();
    });
    it("shows all categories when input is cleared", () => {
      renderDeleteDialog();
      openPopover();

      typeInInput("groceries");
      typeInInput("");

      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Bills")).toBeInTheDocument();
    });
    it("when filtering the first option is selected visually", async () => {
      renderDeleteDialog();
      openPopover();

      expect(screen.getByText(/plan categories/i)).toBeInTheDocument();
      typeInInput("din");

      expect(
        screen.getByRole("option", { name: /dining out/i })
      ).toHaveAttribute("aria-selected", "true");
    });
  });
});
