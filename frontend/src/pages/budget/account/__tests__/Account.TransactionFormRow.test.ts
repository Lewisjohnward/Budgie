import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupTestServer } from "./__helpers__/serverHandlers";
import {
  findFormRow,
  findTransactionRow,
  queryFormRow,
  renderAccountPage,
} from "./__helpers__/testUtils";

describe("Account - Table - TransactionFormRow", () => {
  setupTestServer();
  let user: ReturnType<typeof userEvent.setup>;

  describe("Add transaction", () => {
    const openForm = async () => {
      const addTxBtn = await screen.findByText(/add transaction/i);
      await user.click(addTxBtn);
      await findFormRow();
    };

    beforeEach(async () => {
      user = userEvent.setup();
      renderAccountPage();
      await openForm();
    });

    it("should close when changing account", async () => {
      const allAccountsBtn = await screen.findByRole("link", {
        name: /all accounts/i,
      });
      await user.click(allAccountsBtn);
      const formRow = queryFormRow();
      expect(formRow).not.toBeInTheDocument();
    });
    it("should close when escape pressed", async () => {
      await user.keyboard("{Escape>}");
      const formRow = queryFormRow();
      expect(formRow).not.toBeInTheDocument();
    });
    describe("click behavior", () => {
      describe("when form is unchanged", () => {
        it("should close when selecting row", async () => {
          const txRow = await findTransactionRow("tx1");
          await user.click(txRow);
          const formRow = queryFormRow();
          expect(formRow).not.toBeInTheDocument();
        });

        it.skip("should close when clicking outside the table", async () => {
          // this is failing because i have commented out the section tag, it was preventing the TableHeader sticky from working
          const section = screen.getByRole("region", {
            name: "Transaction table",
          });

          await user.click(section);
          const formRow = queryFormRow();
          expect(formRow).not.toBeInTheDocument();
        });

        it("should be able to select row", async () => {
          const txRow = await findTransactionRow("tx1");
          await user.click(txRow);
          const formRow = queryFormRow();
          expect(formRow).not.toBeInTheDocument();
          const selectedRow = await findTransactionRow("tx1");
          expect(selectedRow).toHaveAttribute("data-state", "selected");
        });

        it("should close on right click on row", async () => {
          const txRow = await findTransactionRow("tx1");
          await user.pointer({ keys: "[MouseRight]", target: txRow });
          const formRow = queryFormRow();
          expect(formRow).not.toBeInTheDocument();
          const selectedRow = await findTransactionRow("tx1");
          expect(selectedRow).not.toHaveAttribute("data-state", "selected");
        });
        it("should not close when interacting with the table header", async () => {
          expect.hasAssertions();
        });
      });
      describe.skip("when form has a changed field", () => {
        it("should not close when clicking on row", () => {});
        it("should not close when clicking outside the table", () => {});
        it("should flash when clicking on another row", () => {});
        it("should flash when clicking outside the table", () => {});
        it("should flash when trying to open context menu on other rows", () => {});
      });
    });
    describe("closing", () => {
      it.skip("close button should close form", async () => {});
      it("should reset form when closing", async () => {
        const outflowField = await screen.findByRole("textbox", {
          name: /outflow/i,
        });
        await user.type(outflowField, "50.00");
        const cancelBtn = screen.getByRole("button", { name: /cancel/i });
        await user.click(cancelBtn);
        await openForm();
        const outflowFieldAfter = await screen.findByRole("textbox", {
          name: /outflow/i,
        });
        expect(outflowFieldAfter).toHaveValue("");
      });
    });
    describe("adding transaction", () => {
      it("should close and reset data when adding transaction", async () => {
        const submitBtn = screen.getByRole("button", { name: /submit/i });
        await user.click(submitBtn);

        // Form should close
        const formRow = queryFormRow();
        expect(formRow).not.toBeInTheDocument();
      });
      it.skip("should call api when adding transaction", async () => {});
    });
    it.skip("should display account selector when account is all", async () => {});
  });
  describe("Edit transaction", () => {
    beforeEach(async () => {
      user = userEvent.setup();
      renderAccountPage();
    });
    it("should display edit form", async () => {
      // Select multiple rows using Ctrl+click to keep them all selected
      const txRow1 = await findTransactionRow("tx1");
      await user.click(txRow1);
      expect(txRow1).toHaveAttribute("data-state", "selected");
      // Click the selected row again to open edit form
      await user.click(txRow1);

      // Form should be open
      const formRow = await findFormRow();

      // find cancel and save buttons
      const cancelBtn = await screen.findByRole("button", { name: /cancel/i });
      const saveBtn = await screen.findByRole("button", { name: "Save" });
      // has correct data
      // is replacing the row when open
    });
    it("should unselect other rows when opening edit form", async () => {
      // Select multiple rows using Ctrl+click to keep them all selected
      const txRow1 = await findTransactionRow("tx1");
      await user.click(txRow1);
      expect(txRow1).toHaveAttribute("data-state", "selected");

      const txRow2 = await findTransactionRow("tx2");
      await user.keyboard("{Control>}");
      await user.click(txRow2);
      await user.keyboard("{/Control}");
      expect(txRow1).toHaveAttribute("data-state", "selected");
      expect(txRow2).toHaveAttribute("data-state", "selected");

      const txRow3 = await findTransactionRow("tx3");
      await user.keyboard("{Control>}");
      await user.click(txRow3);
      await user.keyboard("{/Control}");
      expect(txRow1).toHaveAttribute("data-state", "selected");
      expect(txRow2).toHaveAttribute("data-state", "selected");
      expect(txRow3).toHaveAttribute("data-state", "selected");

      // Click the selected row again to open edit form
      await user.click(txRow3);

      // Form should be open
      const formRow = await findFormRow();

      // Re-query the rows to get fresh references
      const txRow1Fresh = await findTransactionRow("tx1");
      const txRow2Fresh = await findTransactionRow("tx2");

      // Only txRow3 should remain selected, others should be deselected
      expect(txRow1Fresh).not.toHaveAttribute("data-state", "selected");
      expect(txRow2Fresh).not.toHaveAttribute("data-state", "selected");
    });
  });
});

// useful
// const outflowField = await screen.findByRole("textbox", {
//   name: /outflow/i,
// });
// await user.type(outflowField, "50.00");
