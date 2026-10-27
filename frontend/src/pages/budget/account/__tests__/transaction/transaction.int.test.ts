import { setSnapshot } from "../__helpers__/msw/state";
import { renderAccountPage } from "../__helpers__/testUtils";
import { server, setupTestServer } from "../__helpers__/msw/server";
import { baseSnapshot } from "./transaction.snapshot";
import { getUser, setupUser } from "../__helpers__/user";
import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { createTransactionHandler } from "./transaction.msw";
import {
  assertTransaction,
  assertTransactionEditorIsClosed,
  assertTransactionFormHasDefaultValues,
  closeTransactionEditor,
  createTransaction,
  openTransactionEditor,
} from "../helpers/table.helpers";
import { assertAccountTitle } from "../helpers/account.helpers";

setupTestServer();

const setupTransactionTest = (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  server.use(createTransactionHandler);
  renderAccountPage();
  setupUser();
};

describe("transaction editor row", () => {
  beforeEach(() => {
    setupTransactionTest(baseSnapshot);
  });

  it("opens when the user clicks add transaction", async () => {
    const user = getUser();
    await openTransactionEditor(user);
  });

  it("closes when the user clicks cancel", async () => {
    const user = getUser();

    await assertAccountTitle("test-account");

    await openTransactionEditor(user);

    await closeTransactionEditor(user);
  });

  it("creates a transaction when the user clicks submit", async () => {
    const user = getUser();

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
    const user = getUser();

    await assertAccountTitle("test-account");

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
});
