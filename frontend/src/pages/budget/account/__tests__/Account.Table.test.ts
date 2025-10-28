import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { setupTestServer } from "./__helpers__/serverHandlers";
import {
  findTransactionRow,
  queryFormRow,
  renderAccountPage,
} from "./__helpers__/testUtils";
import { manyTransactionsAccountData } from "./__helpers__/mockData";

describe("Account - Table", () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(async () => {
    user = userEvent.setup();
  });

  describe("click behaviour", () => {
    setupTestServer();
    beforeEach(() => {
      renderAccountPage();
    });
    it("should select only the clicked row and deselect others", async () => {
      const txRow1 = await findTransactionRow("tx1");
      const txRow2 = await findTransactionRow("tx2");
      await user.click(txRow1);
      expect(txRow1).toHaveAttribute("data-state", "selected");
      expect(txRow2).not.toHaveAttribute("data-state", "selected");
      await user.click(txRow2);
      expect(txRow1).not.toHaveAttribute("data-state", "selected");
      expect(txRow2).toHaveAttribute("data-state", "selected");
    });

    it("should deselect all when pressing esc", async () => {
      const txRow1 = await findTransactionRow("tx1");
      await user.click(txRow1);
      expect(txRow1).toHaveAttribute("data-state", "selected");
      await user.keyboard("{Escape>}");
      expect(txRow1).not.toHaveAttribute("data-state", "selected");
    });

    it("should multi-select using ctrl+click", async () => {
      const txRow1 = await findTransactionRow("tx1");
      const txRow2 = await findTransactionRow("tx2");
      await user.click(txRow2);
      await user.keyboard("{Control>}");
      await user.click(txRow1);
      await user.keyboard("{/Control}");
      expect(txRow1).toHaveAttribute("data-state", "selected");
      expect(txRow2).toHaveAttribute("data-state", "selected");
    });

    it("should range-select using shift+click", async () => {
      const txRow1 = await findTransactionRow("tx1");
      const txRow2 = await findTransactionRow("tx2");
      const txRow3 = await findTransactionRow("tx3");
      await user.click(txRow1);
      await user.keyboard("{Shift>}");
      await user.click(txRow3);
      await user.keyboard("{/Shift}");
      expect(txRow1).toHaveAttribute("data-state", "selected");
      expect(txRow2).toHaveAttribute("data-state", "selected");
      expect(txRow3).toHaveAttribute("data-state", "selected");
    });

    it("should not open transaction edit form when holding ctrl", async () => {
      const txRow1 = await findTransactionRow("tx1");
      const txRow2 = await findTransactionRow("tx2");
      await user.click(txRow1);
      await user.keyboard("{Control>}");
      await user.click(txRow2);
      expect(txRow2).toHaveAttribute("data-state", "selected");
      await user.click(txRow2);
      await user.keyboard("{/Control>}");
      const formRow = queryFormRow();
      expect(formRow).not.toBeInTheDocument();
      expect(txRow1).toHaveAttribute("data-state", "selected");
      expect(txRow2).not.toHaveAttribute("data-state", "selected");
    });

    it("should not open transaction edit form when holding shift", async () => {
      const txRow1 = await findTransactionRow("tx1");
      const txRow2 = await findTransactionRow("tx2");
      await user.click(txRow1);
      expect(txRow1).toHaveAttribute("data-state", "selected");
      await user.keyboard("{Shift>}");
      await user.click(txRow2);
      expect(txRow2).toHaveAttribute("data-state", "selected");
      await user.click(txRow2);
      expect(txRow2).toHaveAttribute("data-state", "selected");
      await user.keyboard("{/Shift}");
      const formRow = queryFormRow();
      expect(formRow).not.toBeInTheDocument();
    });
  });

  // describe("sticky header", () => {
  //   setupTestServer({ accountData: manyTransactionsAccountData });
  //   beforeEach(() => {
  //     renderAccountPage();
  //   });

  //   it.only("header should be visible even when there are a lot of rows and scrolled to bottom", async () => {
  //     // Wait for transactions to load
  //     await screen.findByRole("row", { name: /tx-1\s*£/i });

  //     // Get the header before scrolling
  //     const headerCells = screen.getAllByRole("columnheader");
  //     const firstHeader = headerCells[0];

  //     // Get initial position
  //     const initialRect = firstHeader.getBoundingClientRect();
  //     const initialTop = initialRect.top;

  //     // Find the table and scroll to bottom
  //     const table = screen.getByRole("table");
  //     const tableContainer = table.parentElement!;
  //     tableContainer.scrollTop = tableContainer.scrollHeight;

  //     // Wait for scroll to complete
  //     await new Promise((resolve) => setTimeout(resolve, 100));

  //     // Get position after scrolling
  //     const scrolledRect = firstHeader.getBoundingClientRect();
  //     const scrolledTop = scrolledRect.top;

  //     // With sticky positioning, the header should stay at the same viewport position
  //     // (or close to it, accounting for any container offset)
  //     expect(scrolledTop).toBe(initialTop);

  //     // Also verify it's still visible in the viewport
  //     expect(firstHeader).toBeVisible();
  //     expect(scrolledTop).toBeGreaterThanOrEqual(0);
  //   });
  // });
});
