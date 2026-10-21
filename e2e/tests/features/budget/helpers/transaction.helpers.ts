import { expect, Page } from "@playwright/test";

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

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);

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

export const assertTransactionCount = async (
  page: Page,
  expectedCount: number
) => {
  const transactions = page.getByRole("table", {
    name: "Transactions",
  });

  await expect(transactions.getByRole("row")).toHaveCount(expectedCount + 1);
};
