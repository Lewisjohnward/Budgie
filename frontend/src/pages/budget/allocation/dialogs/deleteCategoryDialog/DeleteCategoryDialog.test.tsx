import { describe, it, expect } from "vitest";
import { DeleteDialog } from "./DeleteDialog";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CategoryGroupId, CategoryId } from "../../types/types";
import userEvent from "@testing-library/user-event";
import { ComponentProps, useState } from "react";

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

type DeleteCategoryDialogProps = ComponentProps<typeof DeleteDialog>;

interface StatefulDialogWrapperProps {
  defaultProps: Partial<DeleteCategoryDialogProps>;
  overrideProps?: Partial<DeleteCategoryDialogProps>;
  mocks: ReturnType<typeof createMocks>;
}

function StatefulDialogWrapper({
  defaultProps,
  overrideProps,
  mocks,
}: StatefulDialogWrapperProps) {
  const [open, setOpen] = useState(true);

  const props = {
    ...defaultProps,
    ...overrideProps,
    open,
    accept: mocks.accept,
    cancel: () => {
      mocks.cancel();
      setOpen(false);
    },
  } as DeleteCategoryDialogProps;

  return <DeleteDialog {...props} />;
}

function renderDeleteDialog(
  overrideProps: Partial<DeleteCategoryDialogProps> = {},
  mocks = createMocks()
) {
  const utils = render(
    <StatefulDialogWrapper
      defaultProps={defaultProps}
      overrideProps={overrideProps}
      mocks={mocks}
    />
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
      renderDeleteDialog();

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    it("closes modal when x is clicked", () => {
      renderDeleteDialog();

      fireEvent.click(screen.getByRole("button", { name: /close/i }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    it("doesn't close modal when clicking outside", async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      renderDeleteDialog();

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });
    it("closes modal when pressing escape key", async () => {
      const user = userEvent.setup();
      renderDeleteDialog();

      const dialog = screen.getByRole("dialog");

      await user.keyboard("{Escape}");

      expect(dialog).not.toBeInTheDocument();
    });
    it("calls accept with inheritingCategoryId when deleting a category with transactions", async () => {
      const user = userEvent.setup();
      const { mocks } = renderDeleteDialog();

      openPopover();

      const option = screen.getByRole("option", { name: /bills/i });
      await user.click(option);

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      expect(mocks.accept).toHaveBeenCalledTimes(1);
      // assert that accept was called with the correct ID
      expect(mocks.accept).toHaveBeenCalledWith({
        type: "category",
        inheritingCategoryId: "2",
      });
    });
  });

  describe("category", () => {
    describe("has transactions", () => {
      // ---------------------------
      // POPOVER BEHAVIOUR
      // ---------------------------
      describe("reassign popover", () => {
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
        it("only selects the category at the top on blur of input when it is not empty", async () => {
          const user = userEvent.setup();

          renderDeleteDialog();
          openPopover();

          const input = screen.getByRole("textbox");

          const dialog = screen.getByRole("dialog", {
            name: /delete category/i,
          });
          await user.click(dialog);

          await waitFor(() => {
            expect(input).toHaveValue("");
          });
        });
        it("clears input on blur if all categories filtered", async () => {
          const user = userEvent.setup();

          renderDeleteDialog();
          openPopover();

          const input = screen.getByRole("textbox");

          await user.type(input, "non-existent-category");

          const dialog = screen.getByRole("dialog", {
            name: /delete category/i,
          });
          await user.click(dialog);

          await waitFor(() => {
            expect(input).toHaveValue("");
          });
        });
        it("selects the category at the top on blur of input", async () => {
          const user = userEvent.setup();

          renderDeleteDialog();
          openPopover();

          const input = screen.getByRole("textbox");

          await user.type(input, "dining");

          const dialog = screen.getByRole("dialog", {
            name: /delete category/i,
          });
          await user.click(dialog);

          await waitFor(() => {
            expect(input).toHaveValue("Leisure: Dining Out");
          });
        });
        it("closes modal when pressing escape key", async () => {
          const user = userEvent.setup();
          renderDeleteDialog();
          openPopover();

          const dialog = screen.getByRole("dialog", {
            name: /delete category/i,
          });
          const input = screen.getByRole("textbox");
          await user.type(input, "dining");
          await user.keyboard("{Escape}");

          expect(dialog).not.toBeInTheDocument();
        });

        it("closes popover when focus leaves input", async () => {
          const user = userEvent.setup();

          renderDeleteDialog();
          openPopover();

          const input = screen.getByRole("textbox");

          await user.click(input);

          const dialog = screen.getByRole("dialog", {
            name: /delete category/i,
          });
          await user.click(dialog);

          await waitFor(() => {
            expect(
              screen.queryByText(/plan categories/i)
            ).not.toBeInTheDocument();
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
          expect(
            screen.getByRole("option", { name: /bills/i })
          ).toHaveAttribute("aria-selected", "true");

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

          expect(
            screen.queryByText(/plan categories/i)
          ).not.toBeInTheDocument();
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
        it("does not crash when filtered group has no categories", () => {
          const selectOptions = [
            {
              id: "group-1" as CategoryGroupId,
              name: "Important",
              categories: [
                { id: "1" as CategoryId, name: "Groceries", available: 100 },
              ],
            },
            {
              id: "group-2" as CategoryGroupId,
              name: "Leisure",
              categories: [],
            },
          ];

          renderDeleteDialog({
            selectOptions,
          });

          openPopover();

          const input = screen.getByRole("textbox");

          // filter everything out but empty category group out
          fireEvent.change(input, { target: { value: "Leisure" } });

          // UI should still be stable
          expect(screen.getByText(/plan categories/i)).toBeInTheDocument();

          // popover should only display the category group
          expect(screen.queryByText(/leisure/i)).toBeInTheDocument();
          expect(screen.queryByText(/important/i)).not.toBeInTheDocument();
        });
      });
    });
    describe("has assigned", () => {
      it("displays reassign view", async () => {
        const user = userEvent.setup();
        const { mocks } = renderDeleteDialog({
          state: {
            type: "category",
            categoryId: "1" as CategoryId,
            name: "Food",
            transactionCount: 0,
            hasAssigned: true,
          },
        });

        // 1. Assert warning text is present
        expect(
          screen.getByText(/all assigned amounts will be moved to/i)
        ).toBeInTheDocument();
        expect(screen.getByText("Ready to Assign.")).toBeInTheDocument();

        // 2. Assert selection popover input is hidden
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

        // 3. Assert delete button is enabled immediately and executes cleanly
        const deleteButton = screen.getByRole("button", { name: /delete/i });
        expect(deleteButton).not.toBeDisabled();

        await user.click(deleteButton);
        expect(mocks.accept).toHaveBeenCalledWith({
          type: "category",
          categoryId: "1",
        });
      });
    });
  });

  describe("category group", () => {
    describe("categories have transactions", () => {
      it("renders heading when deleting a category group", () => {
        renderDeleteDialog({
          state: {
            type: "categoryGroup",
            name: "Leisure Group",
            transactionCount: 2,
            categoryCount: 3,
            hasAssigned: false,
          },
        });

        expect(screen.getByText("Delete Category Group")).toBeInTheDocument();
        expect(screen.queryByText("Delete Category")).not.toBeInTheDocument();
        expect(screen.getByText(/\[3\]/i)).toBeInTheDocument();
      });
    });
    describe("category has no transactions but money assigned", () => {
      it("renders heading when deleting a category group", () => {
        renderDeleteDialog({
          state: {
            type: "categoryGroup",
            name: "Leisure Group",
            transactionCount: 2,
            categoryCount: 3,
            hasAssigned: false,
          },
        });

        expect(screen.getByText("Delete Category Group")).toBeInTheDocument();
        expect(screen.queryByText("Delete Category")).not.toBeInTheDocument();
        expect(screen.getByText(/\[3\]/i)).toBeInTheDocument();
      });
    });
  });
});
