import { formatCurrency } from "@/utils/formatCurrency";
import { screen, within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";

export const getTransactionRow = async (memo: string) =>
  screen.findByRole("row", { name: new RegExp(memo, "i") });

export const openTransactionEditor = async (user: UserEvent) => {
  const addTransactionButton = await screen.findByRole("button", {
    name: /add transaction/i,
  });

  await user.click(addTransactionButton);

  expect(
    await screen.findByRole("row", { name: "Transaction editor" })
  ).toBeInTheDocument();
};

export const closeTransactionEditor = async (user: UserEvent) => {
  const closeEditButton = await screen.findByRole("button", {
    name: /cancel/i,
  });
  await user.click(closeEditButton);

  expect(
    screen.queryByRole("row", { name: "Transaction editor" })
  ).not.toBeInTheDocument();
};

export const assertTransactionEditorIsClosed = async () => {
  expect(
    screen.queryByRole("row", { name: "Transaction editor" })
  ).not.toBeInTheDocument();
};

type CreateTransactionOptions = {
  memo: string;
  outflow?: number;
  inflow?: number;
  saveAndAddAnother?: boolean;
};

export const setMemoField = async (user: UserEvent, memo: string) => {
  const memoInput = await screen.findByRole("textbox", { name: /memo/i });
  await user.type(memoInput, memo);
};

export const createTransaction = async (
  user: UserEvent,
  options: CreateTransactionOptions
) => {
  await openTransactionEditor(user);

  await setMemoField(user, options.memo);

  if (options.outflow) {
    const outflowInput = await screen.findByRole("textbox", {
      name: /outflow/i,
    });
    await user.type(outflowInput, options.outflow.toString());
  }

  if (options.inflow) {
    const inflowInput = await screen.findByRole("textbox", {
      name: /inflow/i,
    });
    await user.type(inflowInput, options.inflow.toString());
  }

  const buttonName = options.saveAndAddAnother
    ? /save and add another/i
    : /submit/i;

  const submitButton = await screen.findByRole("button", {
    name: buttonName,
  });

  await user.click(submitButton);
};

type TransactionExpectation = {
  date: Date;
  payee?: string;
  category: string;
  memo: string;
  outflow: number;
  inflow: number;
};

export const assertTransaction = async (expected: TransactionExpectation) => {
  const transactions = screen.getByRole("table", {
    name: "Transactions",
  });
  const rows = within(transactions).getAllByRole("row");
  const transaction = rows.find((row) =>
    within(row).queryByText(expected.memo, { exact: true })
  );

  expect(transaction).toBeDefined();

  if (!transaction) {
    return;
  }

  const cells = within(transaction).getAllByRole("cell");

  expect(cells[1]).toHaveTextContent(expected.date.toLocaleDateString("en-GB"));

  expect(cells[2]).toHaveTextContent(expected.payee ?? "");

  expect(cells[3]).toHaveTextContent(expected.category);

  expect(cells[4]).toHaveTextContent(expected.memo);

  expect(cells[5]).toHaveTextContent(
    expected.outflow === 0 ? "" : formatCurrency(expected.outflow)
  );

  expect(cells[6]).toHaveTextContent(
    expected.inflow === 0 ? "" : formatCurrency(expected.inflow)
  );
};

export const assertTransactionFormHasDefaultValues = async () => {
  expect(await screen.findByRole("textbox", { name: /date/i })).toHaveValue(
    new Date().toLocaleDateString("en-GB")
  );

  expect(await screen.findByRole("textbox", { name: /payee/i })).toHaveValue(
    ""
  );

  expect(await screen.findByRole("textbox", { name: /category/i })).toHaveValue(
    ""
  );

  expect(await screen.findByRole("textbox", { name: /memo/i })).toHaveValue("");

  expect(await screen.findByRole("textbox", { name: /inflow/i })).toHaveValue(
    ""
  );

  expect(await screen.findByRole("textbox", { name: /outflow/i })).toHaveValue(
    ""
  );
};
