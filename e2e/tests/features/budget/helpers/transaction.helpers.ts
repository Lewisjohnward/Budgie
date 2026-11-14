import { expect, Locator, Page } from "@playwright/test";

export const expectTransactionCategoryVisible = async (
  page: Page,
  categoryGroup: string,
  category: string
): Promise<void> => {
  const row = page.getByRole("row").filter({
    hasText: `${categoryGroup} : ${category}`,
  });

  await expect(row).toBeVisible();
};

type CreateTransactionInput = {
  date?: Date;
  memo: string;
  category?: string;
} & ({ outflow: number; inflow?: never } | { inflow: number; outflow?: never });

export const createTransaction = async (
  page: Page,
  input: CreateTransactionInput
) => {
  await page.getByRole("button", { name: "Add Transaction" }).click();

  if (input.date) {
    await page.getByRole("textbox", { name: "Date" }).click();

    await page
      .getByRole("gridcell", {
        name: String(input.date.getDate()),
        selected: true,
      })
      .click();
  }

  if (input.category !== undefined) {
    await page.getByRole("textbox", { name: "Category" }).click();
    await page.getByRole("button", { name: input.category }).click();
  }

  await page.getByRole("textbox", { name: "Memo" }).fill(input.memo);

  if (input.outflow !== undefined) {
    await page
      .getByRole("textbox", { name: "Outflow" })
      .fill(input.outflow.toFixed(2));
  }

  if (input.inflow !== undefined) {
    await page
      .getByRole("textbox", { name: "Inflow" })
      .fill(input.inflow.toFixed(2));
  }

  await page.getByRole("button", { name: /submit/i }).click();
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);

export const getTransactionRow = (page: Page, memo: string) =>
  page.getByRole("row", { name: new RegExp(memo, "i") });

export const getTransactionRows = (page: Page, memos: string[]) => {
  const table = page.getByRole("table", {
    name: "Transactions",
  });

  const memoRegex = new RegExp(
    `^(?:${memos.map((memo) => memo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})$`
  );

  return table.getByRole("row").filter({
    has: page.getByText(memoRegex, { exact: true }),
  });
};

type TransactionExpectation = {
  date: Date;
  category: string;
  memo: string;
  outflow: number;
  inflow: number;
};

export const assertTransaction = async (
  page: Page,
  expected: TransactionExpectation
) => {
  const transactions = page.getByRole("table", {
    name: "Transactions",
  });

  const transaction = transactions
    .getByRole("row")
    .filter({ hasText: expected.memo });

  await expect(transaction).toBeVisible();

  const columnNames = [
    "Date",
    "Category",
    "Memo",
    "Outflow",
    "Inflow",
  ] as const;

  const columnIndices = await Promise.all(
    columnNames.map(async (name) =>
      transactions
        .getByRole("columnheader", { name, exact: true })
        .evaluate((element) =>
          Array.from(element.parentElement!.children).indexOf(element)
        )
    )
  );

  const cells = transaction.getByRole("cell");

  await expect(cells.nth(columnIndices[0])).toHaveText(
    expected.date.toLocaleDateString("en-GB")
  );
  await expect(cells.nth(columnIndices[1])).toHaveText(expected.category);
  await expect(cells.nth(columnIndices[2])).toHaveText(expected.memo);
  await expect(cells.nth(columnIndices[3])).toHaveText(
    expected.outflow === 0 ? "" : formatCurrency(expected.outflow)
  );
  await expect(cells.nth(columnIndices[4])).toHaveText(
    expected.inflow === 0 ? "" : formatCurrency(expected.inflow)
  );
};

export const assertTransactionRows = async (
  page: Page,
  rows: Locator,
  expected: TransactionExpectation
) => {
  const count = await rows.count();

  await Promise.all(
    Array.from({ length: count }, (_, i) =>
      assertTransactionRowByLocator(page, rows.nth(i), expected)
    )
  );
};

export const assertTransactionRowByLocator = async (
  page: Page,
  row: Locator,
  expected: TransactionExpectation
) => {
  await expect(row).toBeVisible();

  const columnNames = [
    "Date",
    "Category",
    "Memo",
    "Outflow",
    "Inflow",
  ] as const;

  const columnIndices = await Promise.all(
    columnNames.map(async (name) =>
      page
        .getByRole("table", { name: "Transactions" })
        .getByRole("columnheader", { name, exact: true })
        .evaluate((element) =>
          Array.from(element.parentElement!.children).indexOf(element)
        )
    )
  );

  const cells = row.getByRole("cell");

  const expectedValues = [
    expected.date.toLocaleDateString("en-GB"),
    expected.category,
    expected.memo,
    expected.outflow === 0 ? "" : formatCurrency(expected.outflow),
    expected.inflow === 0 ? "" : formatCurrency(expected.inflow),
  ];

  await Promise.all(
    columnIndices.map((index, i) =>
      expect(cells.nth(index)).toHaveText(expectedValues[i])
    )
  );
};

export const assertTransactionCount = async (
  page: Page,
  expectedCount: number
) => {
  const transactions = page.getByRole("table", {
    name: "Transactions",
  });

  await expect(transactions.getByRole("row")).toHaveCount(expectedCount + 1);
};

export const assertNewTransactionsToCategorise = async (
  page: Page,
  count: number = 1
) => {
  const button = page.getByRole("button", {
    name: new RegExp(`^${count} new transactions? to categorise`),
  });

  await expect(button).toBeVisible();
};

export const openContextMenu = async (
  page: Page,
  { memo }: { memo: string }
) => {
  const transaction = getTransactionRow(page, memo);

  await transaction.click({ button: "right" });

  await expect(page.getByRole("menu")).toBeVisible();
};

export const duplicateTransactions = async (page: Page, memos: string[]) => {
  for (const memo of memos) {
    const transaction = getTransactionRow(page, memo);
    await transaction.click({ modifiers: ["Control"] });
  }

  const lastSelectedMemo = memos[memos.length - 1];

  await openContextMenu(page, { memo: lastSelectedMemo });

  await page
    .getByRole("menuitem", {
      name: "duplicate",
    })
    .click();
};

  await page
    .getByRole("menuitem", {
      name: "duplicate",
    })
    .click();
};
