import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { UserEvent } from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { server, setupTestServer } from "../../__helpers__/msw/server";
import { setSnapshot } from "../../__helpers__/msw/state";
import { renderAccountPage } from "../../__helpers__/testUtils";
import { setupUser } from "../../__helpers__/user";
import { assertAccountTitle } from "../../helpers/account.helpers";
import {
  openTransactionEditor,
  closeTransactionEditor,
  assertTransaction,
  assertTransactionEditorIsClosed,
  assertTransactionFormHasDefaultValues,
  createTransaction,
} from "../../helpers/table.helpers";
import { createTransactionHandler } from "./transactionEditor.msw";
import { baseSnapshot } from "./transactionEditor.snapshot";

setupTestServer();

const setupTransactionTest = async (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  server.use(createTransactionHandler);
  renderAccountPage();
  await assertAccountTitle("test-account");
  return setupUser();
};

describe("transaction editor row", () => {
  let user: UserEvent;
  beforeEach(async () => {
    user = await setupTransactionTest(baseSnapshot);
  });

  it("opens when the user clicks add transaction", async () => {
    await openTransactionEditor(user);
  });

  it("closes when the user clicks cancel", async () => {
    await openTransactionEditor(user);

    await closeTransactionEditor(user);
  });

  it("creates a transaction when the user clicks submit", async () => {
    await assertAccountTitle("test-account");

    await openTransactionEditor(user);

    await createTransaction(user, {
      memo: "test transaction",
      outflow: 10,
    });

    await assertTransaction({
      date: new Date(),
      category: "This needs a category",
      memo: "test transaction",
      outflow: 10,
      inflow: 0,
    });

    await assertTransactionEditorIsClosed();
  });

  it("creates a transaction and keeps the editor open with an empty form when saving and adding another", async () => {
    await createTransaction(user, {
      memo: "test transaction",
      outflow: 10,
      saveAndAddAnother: true,
    });

    await assertTransaction({
      date: new Date(),
      category: "This needs a category",
      memo: "test transaction",
      outflow: 10,
      inflow: 0,
    });

    await assertTransactionFormHasDefaultValues();
  });

  describe("keyboard", () => {
    it("escape closes transaction editor", async () => {
      await openTransactionEditor(user);
      await user.keyboard("{Escape}");
      expect(
        screen.queryByRole("row", { name: "Transaction editor" })
      ).not.toBeInTheDocument();
    });
    it("shift+n opens transaction editor", async () => {
      await user.keyboard("{Shift>}N{/Shift}");

      expect(
        await screen.findByRole("row", { name: "Transaction editor" })
      ).toBeInTheDocument();
    });

    it("doesn't reset editor when typing N into memo field", async () => {
      await openTransactionEditor(user);
    });
  });
});
