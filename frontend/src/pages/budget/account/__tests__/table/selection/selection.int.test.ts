import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { screen, within } from "@testing-library/react";
import { server, setupTestServer } from "../../__helpers__/msw/server";
import { setSnapshot } from "../../__helpers__/msw/state";
import { renderAccountPage } from "../../__helpers__/testUtils";
import { setupUser, getUser } from "../../__helpers__/user";
import { getTransactionRow } from "../../helpers/table.helpers";
import { createTransactionHandler } from "./selection.msw";
import { baseSnapshot } from "./selection.snapshot";

setupTestServer();

const setupTransactionTest = (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  server.use(createTransactionHandler);
  renderAccountPage();
  setupUser();
};

describe("table", () => {
  beforeEach(() => {
    setupTransactionTest(baseSnapshot);
  });

  describe("selection", () => {
    describe("row", () => {
      it("clicking on a transaction selects it", async () => {
        const user = getUser();

        const transaction = await getTransactionRow("test transaction 1");

        await user.click(transaction);
        expect(transaction.ariaSelected).toBe("true");
      });

      it("clicking on a transaction's checkbox selects it", async () => {
        const user = getUser();
        const transaction = await getTransactionRow("test transaction 1");

        await user.click(await within(transaction).findByRole("checkbox"));

        expect(transaction.ariaSelected).toBe("true");
      });

      it("clicking on a selected transaction's checkbox unselects it", async () => {
        const user = getUser();

        const transaction = await getTransactionRow("test transaction 1");
        await user.click(await within(transaction).findByRole("checkbox"));
        expect(transaction.ariaSelected).toBe("true");

        await user.click(await within(transaction).findByRole("checkbox"));
        expect(transaction.ariaSelected).toBe("false");
      });
    });
    describe("header", () => {
      it("clicking checkbox selects all ", async () => {
        const user = getUser();
        const selectAllCheckbox = await screen.findByRole("checkbox", {
          name: "Toggle select all transactions",
        });

        await user.click(selectAllCheckbox);
        const transaction1 = await getTransactionRow("test transaction 1");
        expect(transaction1.ariaSelected).toBe("true");
        const transaction2 = await getTransactionRow("test transaction 2");
        expect(transaction2.ariaSelected).toBe("true");
        const transaction3 = await getTransactionRow("test transaction 3");
        expect(transaction3.ariaSelected).toBe("true");
      });
      it("when all selected clicking checkbox deselects all ", async () => {
        const user = getUser();
        const selectAllCheckbox = await screen.findByRole("checkbox", {
          name: /Toggle select all transactions/i,
        });

        await user.click(selectAllCheckbox);
        await user.click(selectAllCheckbox);
        const transaction1After = await getTransactionRow("test transaction 1");
        expect(transaction1After.ariaSelected).toBe("false");
        const transaction2After = await getTransactionRow("test transaction 2");
        expect(transaction2After.ariaSelected).toBe("false");
        const transaction3After = await getTransactionRow("test transaction 3");
        expect(transaction3After.ariaSelected).toBe("false");
      });
      it("checkbox has indeterminate state when some transactions are selected", async () => {
        const user = getUser();

        const selectAllCheckbox = await screen.findByRole("checkbox", {
          name: "Toggle select all transactions",
        });
        const transaction1 = await getTransactionRow("test transaction 1");
        await user.click(transaction1);

        expect(selectAllCheckbox).toBePartiallyChecked();
      });
    });
    describe("keyboard", () => {
      it("holding ctrl allows selecting multiple rows", async () => {
        const user = getUser();

        const transaction1 = await getTransactionRow("test transaction 1");
        await user.click(transaction1);
        const transaction3 = await getTransactionRow("test transaction 3");
        const transaction2 = await getTransactionRow("test transaction 2");

        await user.keyboard("{Control>}");
        await user.click(transaction3);
        await user.keyboard("{/Control}");

        expect(transaction1.ariaSelected).toBe("true");
        expect(transaction2.ariaSelected).toBe("false");
        expect(transaction3.ariaSelected).toBe("true");
      });
      it("header checkbox is unchecked when all selected rows are deselected", async () => {
        const user = getUser();

        const transaction1 = await getTransactionRow("test transaction 1");
        const transaction2 = await getTransactionRow("test transaction 2");
        const headerCheckbox = screen.getByRole("checkbox", {
          name: /toggle select all transactions/i,
        });

        await user.click(transaction1);

        await user.keyboard("{Control>}");
        await user.click(transaction2);

        await user.click(transaction1);
        await user.click(transaction2);
        await user.keyboard("{/Control}");

        expect(headerCheckbox).not.toBeChecked();
        expect(headerCheckbox).not.toBePartiallyChecked();
      });
      it("shift selecting selects rows between", async () => {
        const user = getUser();

        const transaction1 = await getTransactionRow("test transaction 1");
        const transaction2 = await getTransactionRow("test transaction 2");
        const transaction3 = await getTransactionRow("test transaction 3");
        const transaction4 = await getTransactionRow("test transaction 4");

        await user.click(transaction1);

        await user.keyboard("{Shift>}");
        await user.click(transaction3);
        await user.keyboard("{/Shift}");

        expect(transaction1.ariaSelected).toBe("true");
        expect(transaction2.ariaSelected).toBe("true");
        expect(transaction3.ariaSelected).toBe("true");
        expect(transaction4.ariaSelected).toBe("false");
      });
      it("escape key resets selection", async () => {
        const user = getUser();

        const transaction1 = await getTransactionRow("test transaction 1");
        const transaction2 = await getTransactionRow("test transaction 2");

        await user.click(transaction1);

        await user.keyboard("{Control>}");
        await user.click(transaction2);
        await user.keyboard("{/Control}");
        await user.keyboard("{Escape}");

        expect(transaction1.ariaSelected).toBe("false");
        expect(transaction2.ariaSelected).toBe("false");
      });
    });
  });
});
